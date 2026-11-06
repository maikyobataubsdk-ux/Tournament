"""
Booyahesports JSON Database Manager
Thread-safe, cross-process file-locked, atomic-writing JSON database engine.
Path: /app/data/database.json (or configurable via DATA_DIR)
"""

import os
import sys
import json
import fcntl
import shutil
import logging
from datetime import datetime, timezone
import threading
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable

def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

logger = logging.getLogger("booyah.database")

DATA_DIR = Path(os.getenv("DATA_DIR", "/app/data" if os.path.exists("/app/data") else str(Path(__file__).resolve().parent.parent / "data")))
DB_FILE = DATA_DIR / "database.json"
BACKUP_DIR = DATA_DIR / "backups"
LOCK_FILE = DATA_DIR / ".database.lock"

SCHEMA_VERSION = 1

COLLECTIONS = [
    "users",
    "player_profiles",
    "teams",
    "team_members",
    "tournaments",
    "tournament_registrations",
    "matches",
    "match_players",
    "room_details",
    "match_results",
    "result_evidence",
    "disputes",
    "notifications",
    "app_releases",
    "admin_users",
    "admin_roles",
    "admin_permissions",
    "announcements",
    "settings",
    "audit_logs",
    "support_tickets",
]

DEFAULT_SETTINGS = {
    "site_title": "Booyahesports",
    "domain": "Booyahesports.in",
    "contact_email": "support@booyahesports.in",
    "banner_title": "Battle for Glory in Free Fire MAX",
    "banner_subtitle": "India's Premier Free-Entry Tournament Platform. Play, Compete, Dominate.",
    "discord_url": "https://discord.gg/booyahesports",
    "youtube_url": "https://youtube.com/@booyahesports",
    "instagram_url": "https://instagram.com/booyahesports",
    "registration_enabled": True,
    "maintenance_mode": False,
    "maintenance_message": "Booyahesports is currently undergoing scheduled maintenance. Please check back soon.",
    "points_system": {
        "placement": {
            "1": 12, "2": 9, "3": 8, "4": 7, "5": 6,
            "6": 5, "7": 4, "8": 3, "9": 2, "10": 1,
            "11": 0, "12": 0
        },
        "per_kill": 1
    }
}

DEFAULT_ADMIN_ROLES = [
    {"id": "super_admin", "name": "Super Admin", "permissions": ["*"]},
    {"id": "tournament_manager", "name": "Tournament Manager", "permissions": ["tournaments.*", "registrations.*", "matches.view"]},
    {"id": "room_host", "name": "Room Host", "permissions": ["matches.*", "rooms.*"]},
    {"id": "referee", "name": "Referee", "permissions": ["results.*", "disputes.*"]},
    {"id": "support_admin", "name": "Support Admin", "permissions": ["support.*", "players.view"]},
    {"id": "content_manager", "name": "Content Manager", "permissions": ["announcements.*", "settings.website"]},
]


class JSONDatabaseManager:
    """Thread-safe, cross-process Linux file-locking JSON Database Manager."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = Path(data_dir) if data_dir else DATA_DIR
        self.db_file = self.data_dir / "database.json"
        self.backup_dir = self.data_dir / "backups"
        self.lock_file = self.data_dir / ".database.lock"
        self._thread_lock = threading.RLock()
        self._lock_count = 0
        self._lock_fd = None
        self._ensure_directories()
        self._init_database()

    def _ensure_directories(self):
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(self.data_dir, 0o750)
            os.chmod(self.backup_dir, 0o750)
        except Exception:
            pass

    def _acquire_lock(self):
        self._thread_lock.acquire()
        if self._lock_count == 0:
            self._lock_fd = open(self.lock_file, "w+")
            fcntl.flock(self._lock_fd, fcntl.LOCK_EX)
        self._lock_count += 1

    def _release_lock(self):
        try:
            self._lock_count -= 1
            if self._lock_count == 0:
                if self._lock_fd:
                    try:
                        fcntl.flock(self._lock_fd, fcntl.LOCK_UN)
                    finally:
                        self._lock_fd.close()
                        self._lock_fd = None
        finally:
            self._thread_lock.release()

    class _LockContext:
        def __init__(self, db_mgr):
            self.db_mgr = db_mgr

        def __enter__(self):
            self.db_mgr._acquire_lock()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.db_mgr._release_lock()

    def _lock(self):
        return self._LockContext(self)

    def _init_database(self):
        """Initialize database file if not present or recover if corrupted."""
        with self._lock():
            if not self.db_file.exists():
                logger.info("Initializing new database at %s", self.db_file)
                initial_data = self._create_initial_schema()
                self._write_raw(initial_data)
                self.create_backup("initial_setup")
            else:
                try:
                    data = self._read_raw()
                    if not self._validate_schema(data):
                        logger.warning("Database schema incomplete or corrupted. Performing repair.")
                        data = self._repair_schema(data)
                        self._write_raw(data)
                except Exception as e:
                    logger.error("Database file corrupted on startup: %s. Attempting recovery from backup...", e)
                    if not self._restore_latest_backup():
                        logger.warning("No valid backup found. Initializing clean schema to prevent crash.")
                        clean_data = self._create_initial_schema()
                        self._write_raw(clean_data)

    def _create_initial_schema(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "_schema_version": SCHEMA_VERSION,
            "_created_at": utcnow_iso(),
            "_updated_at": utcnow_iso(),
        }
        for coll in COLLECTIONS:
            data[coll] = []

        data["settings"] = [DEFAULT_SETTINGS]
        data["admin_roles"] = DEFAULT_ADMIN_ROLES
        return data

    def _validate_schema(self, data: Any) -> bool:
        if not isinstance(data, dict):
            return False
        if "_schema_version" not in data:
            return False
        for coll in COLLECTIONS:
            if coll not in data or not isinstance(data[coll], list):
                return False
        return True

    def _repair_schema(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            data = {}
        data["_schema_version"] = data.get("_schema_version", SCHEMA_VERSION)
        data["_updated_at"] = utcnow_iso()
        for coll in COLLECTIONS:
            if coll not in data or not isinstance(data[coll], list):
                if coll == "settings":
                    data[coll] = [DEFAULT_SETTINGS]
                elif coll == "admin_roles":
                    data[coll] = DEFAULT_ADMIN_ROLES
                else:
                    data[coll] = []
        return data

    def _read_raw(self) -> Dict[str, Any]:
        with open(self.db_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write_raw(self, data: Dict[str, Any]):
        """Atomic write using temporary file and os.replace."""
        data["_updated_at"] = utcnow_iso()
        tmp_file = self.db_file.with_suffix(".tmp")
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_file, self.db_file)
        try:
            os.chmod(self.db_file, 0o600)
        except Exception:
            pass

    # Public Collection Operations

    def get_all(self, collection: str) -> List[Dict[str, Any]]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            return list(data.get(collection, []))

    def get_by_id(self, collection: str, item_id: Any, id_field: str = "id") -> Optional[Dict[str, Any]]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            for item in data.get(collection, []):
                if str(item.get(id_field)) == str(item_id):
                    return item
            return None

    def find(self, collection: str, query: Callable[[Dict[str, Any]], bool]) -> List[Dict[str, Any]]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            return [item for item in data.get(collection, []) if query(item)]

    def find_one(self, collection: str, query: Callable[[Dict[str, Any]], bool]) -> Optional[Dict[str, Any]]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            for item in data.get(collection, []):
                if query(item):
                    return item
            return None

    def insert(self, collection: str, document: Dict[str, Any]) -> Dict[str, Any]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            if "created_at" not in document:
                document["created_at"] = utcnow_iso()
            document["updated_at"] = utcnow_iso()
            data[collection].append(document)
            self._write_raw(data)
            return document

    def update(self, collection: str, item_id: Any, updates: Dict[str, Any], id_field: str = "id") -> Optional[Dict[str, Any]]:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            target = None
            for item in data.get(collection, []):
                if str(item.get(id_field)) == str(item_id):
                    updates["updated_at"] = utcnow_iso()
                    item.update(updates)
                    target = item
                    break
            if target is not None:
                self._write_raw(data)
            return target

    def delete(self, collection: str, item_id: Any, id_field: str = "id") -> bool:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        with self._lock():
            data = self._read_raw()
            before_len = len(data.get(collection, []))
            data[collection] = [item for item in data.get(collection, []) if str(item.get(id_field)) != str(item_id)]
            if len(data[collection]) < before_len:
                self._write_raw(data)
                return True
            return False

    def transaction(self, callback: Callable[[Dict[str, Any]], Any]) -> Any:
        """Execute a custom multi-collection atomic transaction."""
        with self._lock():
            data = self._read_raw()
            result = callback(data)
            self._write_raw(data)
            return result

    # Backup & Recovery

    def create_backup(self, tag: str = "auto") -> Path:
        with self._lock():
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            backup_path = self.backup_dir / f"database_{tag}_{timestamp}.json"
            shutil.copy2(self.db_file, backup_path)
            try:
                os.chmod(backup_path, 0o600)
            except Exception:
                pass
            # Keep only the last 30 backups
            backups = sorted(self.backup_dir.glob("database_*.json"), key=os.path.getmtime)
            if len(backups) > 30:
                for b in backups[:-30]:
                    try:
                        b.unlink()
                    except Exception:
                        pass
            return backup_path

    def list_backups(self) -> List[Dict[str, Any]]:
        backups = sorted(self.backup_dir.glob("database_*.json"), key=os.path.getmtime, reverse=True)
        results = []
        for b in backups:
            stat = b.stat()
            results.append({
                "filename": b.name,
                "size_bytes": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
            })
        return results

    def restore_backup(self, filename: str) -> bool:
        backup_file = self.backup_dir / filename
        if not backup_file.exists():
            return False
        with self._lock():
            # Validate backup JSON before restoring
            with open(backup_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not self._validate_schema(data):
                raise ValueError("Backup file schema is invalid")
            self._write_raw(data)
            return True

    def _restore_latest_backup(self) -> bool:
        backups = sorted(self.backup_dir.glob("database_*.json"), key=os.path.getmtime, reverse=True)
        for b in backups:
            try:
                with open(b, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if self._validate_schema(data):
                    self._write_raw(data)
                    logger.info("Successfully restored from backup: %s", b.name)
                    return True
            except Exception:
                continue
        return False


# Singleton instance
db = JSONDatabaseManager()

def get_db() -> JSONDatabaseManager:
    return db
