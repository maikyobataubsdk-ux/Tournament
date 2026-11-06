import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from backend.database import get_db, utcnow_iso
from backend.routers.auth import get_current_admin_user

router = APIRouter(prefix="/announcements", tags=["Announcements"])

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    type: str = "GENERAL"

@router.get("")
def list_announcements():
    db = get_db()
    announcements = db.get_all("announcements")
    return sorted(announcements, key=lambda a: a.get("created_at", ""), reverse=True)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_announcement(req: AnnouncementCreate, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    doc = {
        "id": f"anc_{uuid.uuid4().hex[:12]}",
        "title": req.title,
        "content": req.content,
        "type": req.type,
        "created_by": admin["id"],
        "created_at": utcnow_iso(),
    }
    db.insert("announcements", doc)
    return doc

@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    db.delete("announcements", announcement_id)
    return {"message": "Announcement deleted"}
