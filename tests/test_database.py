import os
import shutil
import tempfile
import pytest
from pathlib import Path
from backend.database import JSONDatabaseManager, SCHEMA_VERSION

def test_database_initialization_and_schema():
    with tempfile.TemporaryDirectory() as tmpdir:
        db = JSONDatabaseManager(data_dir=tmpdir)
        assert db.db_file.exists()
        raw = db._read_raw()
        assert raw["_schema_version"] == SCHEMA_VERSION
        assert "users" in raw
        assert "tournaments" in raw
        assert len(raw["settings"]) == 1
        assert raw["settings"][0]["site_title"] == "Booyahesports"

def test_database_crud_operations():
    with tempfile.TemporaryDirectory() as tmpdir:
        db = JSONDatabaseManager(data_dir=tmpdir)
        user = db.insert("users", {"id": "usr_1", "email": "player@booyahesports.in"})
        assert user["id"] == "usr_1"
        assert "created_at" in user

        fetched = db.get_by_id("users", "usr_1")
        assert fetched is not None
        assert fetched["email"] == "player@booyahesports.in"

        updated = db.update("users", "usr_1", {"email": "player_updated@booyahesports.in"})
        assert updated["email"] == "player_updated@booyahesports.in"

        all_users = db.get_all("users")
        assert len(all_users) == 1

        deleted = db.delete("users", "usr_1")
        assert deleted is True
        assert len(db.get_all("users")) == 0

def test_database_atomic_backup_and_recovery():
    with tempfile.TemporaryDirectory() as tmpdir:
        db = JSONDatabaseManager(data_dir=tmpdir)
        db.insert("tournaments", {"id": "t1", "title": "Grand Booyah Championship"})
        backup = db.create_backup("test")
        assert backup.exists()

        with open(db.db_file, "w") as f:
            f.write("{ invalid json")

        db_recovered = JSONDatabaseManager(data_dir=tmpdir)
        t = db_recovered.get_by_id("tournaments", "t1")
        assert t is not None
        assert t["title"] == "Grand Booyah Championship"
