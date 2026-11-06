import os
import hashlib
import uuid
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status

from backend.database import get_db, utcnow_iso
from backend.routers.auth import get_current_admin_user

router = APIRouter(prefix="/app", tags=["App Releases & Updates"])

RELEASES_DIR = Path(os.getenv("RELEASES_DIR", "/app/releases" if os.path.exists("/app/releases") else str(Path(__file__).resolve().parent.parent.parent / "releases")))
RELEASES_DIR.mkdir(parents=True, exist_ok=True)

def calculate_sha256(filepath: Path) -> str:
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()

@router.get("/health")
def healthcheck():
    db = get_db()
    settings = db.get_all("settings")
    return {
        "status": "healthy",
        "service": "Booyahesports API",
        "timestamp": utcnow_iso(),
        "database_connected": bool(settings)
    }

@router.get("/latest")
def get_latest_release():
    db = get_db()
    releases = db.find("app_releases", lambda r: r.get("is_published", False))
    if not releases:
        return {
            "version_name": "1.0.0",
            "version_code": 1,
            "minimum_supported_version": 1,
            "mandatory": False,
            "release_notes": "Initial launch of Booyahesports",
            "download_url": "/releases/app-latest.apk",
            "sha256": ""
        }

    latest = max(releases, key=lambda r: r.get("version_code", 0))
    return {
        "version_name": latest.get("version_name"),
        "version_code": latest.get("version_code"),
        "minimum_supported_version": latest.get("minimum_supported_version", 1),
        "mandatory": latest.get("mandatory", False),
        "release_notes": latest.get("release_notes", ""),
        "download_url": latest.get("download_url", "/releases/app-latest.apk"),
        "sha256": latest.get("sha256", ""),
        "file_size_bytes": latest.get("file_size_bytes", 0),
        "published_at": latest.get("published_at", latest.get("created_at")),
    }

@router.get("/releases")
def list_all_releases():
    db = get_db()
    releases = db.find("app_releases", lambda r: r.get("is_published", False))
    return sorted(releases, key=lambda r: r.get("version_code", 0), reverse=True)

@router.post("/releases/upload")
async def upload_apk_release(
    file: UploadFile = File(...),
    version_name: str = Form(...),
    version_code: int = Form(...),
    minimum_supported_version: int = Form(...),
    mandatory: bool = Form(False),
    release_notes: str = Form(...),
    publish_now: bool = Form(False),
    admin: dict = Depends(get_current_admin_user)
):
    if not file.filename.endswith(".apk"):
        raise HTTPException(status_code=400, detail="Only .apk files are permitted")

    release_id = f"rel_{uuid.uuid4().hex[:12]}"
    filename = f"booyahesports_v{version_name}_{version_code}.apk"
    target_path = RELEASES_DIR / filename

    contents = await file.read()
    with open(target_path, "wb") as f:
        f.write(contents)

    sha256_hash = calculate_sha256(target_path)
    file_size = target_path.stat().st_size

    if publish_now:
        latest_sym = RELEASES_DIR / "app-latest.apk"
        try:
            if latest_sym.exists() or latest_sym.is_symlink():
                latest_sym.unlink()
            latest_sym.symlink_to(target_path)
        except Exception:
            import shutil
            shutil.copy2(target_path, latest_sym)

    release_doc = {
        "id": release_id,
        "version_name": version_name,
        "version_code": version_code,
        "minimum_supported_version": minimum_supported_version,
        "mandatory": mandatory,
        "release_notes": release_notes,
        "file_path": str(target_path),
        "filename": filename,
        "download_url": f"/releases/{filename}",
        "sha256": sha256_hash,
        "file_size_bytes": file_size,
        "is_published": publish_now,
        "uploaded_by": admin["id"],
        "created_at": utcnow_iso(),
        "published_at": utcnow_iso() if publish_now else None,
    }

    db = get_db()
    db.insert("app_releases", release_doc)

    if publish_now:
        db.insert("announcements", {
            "id": f"anc_{uuid.uuid4().hex[:12]}",
            "title": f"New App Update Available: v{version_name}",
            "content": f"Booyahesports v{version_name} is now available. {release_notes}",
            "type": "UPDATE",
            "created_at": utcnow_iso(),
        })

    return release_doc

@router.post("/releases/{release_id}/publish")
def publish_release(release_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    rel = db.get_by_id("app_releases", release_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Release not found")

    target_path = Path(rel["file_path"])
    latest_sym = RELEASES_DIR / "app-latest.apk"
    if target_path.exists():
        try:
            if latest_sym.exists() or latest_sym.is_symlink():
                latest_sym.unlink()
            latest_sym.symlink_to(target_path)
        except Exception:
            import shutil
            shutil.copy2(target_path, latest_sym)

    updated = db.update("app_releases", release_id, {
        "is_published": True,
        "published_at": utcnow_iso()
    })
    return {"message": "Release published successfully", "release": updated}
