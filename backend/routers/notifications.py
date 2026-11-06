import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db, utcnow_iso
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def list_my_notifications(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    db = get_db()
    notes = db.find("notifications", lambda n: n.get("user_id") == user_id or n.get("is_broadcast", False))
    return sorted(notes, key=lambda n: n.get("created_at", ""), reverse=True)

@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    note = db.get_by_id("notifications", notification_id)
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    if note.get("user_id") != user["id"] and not note.get("is_broadcast", False):
        raise HTTPException(status_code=403, detail="Forbidden")

    updated = db.update("notifications", notification_id, {"is_read": True})
    return updated
