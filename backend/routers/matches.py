import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db, utcnow_iso
from backend.schemas import MatchCreateRequest, RoomCredentialsUpdateRequest
from backend.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/matches", tags=["Matches & Room Management"])

@router.get("")
def list_matches(tournament_id: Optional[str] = None):
    db = get_db()
    if tournament_id:
        matches = db.find("matches", lambda m: m.get("tournament_id") == tournament_id)
    else:
        matches = db.get_all("matches")

    sanitized = []
    for m in matches:
        item = dict(m)
        item.pop("room_password", None)
        if not item.get("is_room_published", False):
            item.pop("room_id", None)
        sanitized.append(item)
    return sanitized

@router.get("/{match_id}")
def get_match(match_id: str):
    m = get_db().get_by_id("matches", match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    item = dict(m)
    item.pop("room_password", None)
    if not item.get("is_room_published", False):
        item.pop("room_id", None)
    return item

@router.post("", status_code=status.HTTP_201_CREATED)
def create_match(req: MatchCreateRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    t = db.get_by_id("tournaments", req.tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    m_id = f"mtch_{uuid.uuid4().hex[:12]}"
    match_doc = {
        "id": m_id,
        "tournament_id": req.tournament_id,
        "match_number": req.match_number,
        "map": req.map,
        "scheduled_at": req.scheduled_at,
        "room_id": req.room_id or "",
        "room_password": req.room_password or "",
        "is_room_published": False,
        "release_credentials_at": req.release_credentials_at or "",
        "status": "SCHEDULED",
        "created_at": utcnow_iso(),
    }
    db.insert("matches", match_doc)
    return match_doc

@router.patch("/{match_id}/room-credentials")
def update_room_credentials(match_id: str, req: RoomCredentialsUpdateRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    match = db.get_by_id("matches", match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    updates = {
        "room_id": req.room_id,
        "room_password": req.room_password,
        "is_room_published": req.release_now,
        "release_credentials_at": req.release_credentials_at or match.get("release_credentials_at", "")
    }
    if req.release_now:
        updates["status"] = "ROOM_OPEN"

    updated_match = db.update("matches", match_id, updates)

    if req.release_now:
        regs = db.find("tournament_registrations", lambda r: r.get("tournament_id") == match["tournament_id"])
        for r in regs:
            for u_id in r.get("member_ids", [r.get("user_id")]):
                db.insert("notifications", {
                    "id": f"notif_{uuid.uuid4().hex[:12]}",
                    "user_id": u_id,
                    "title": f"Room Details Released: Match #{match.get('match_number')}",
                    "message": "Room ID and Password are now available in your match screen. Join Free Fire MAX promptly!",
                    "is_read": False,
                    "is_broadcast": False,
                    "created_at": utcnow_iso(),
                })

    return {"message": "Room credentials updated successfully", "match": updated_match}

@router.get("/{match_id}/room-details")
def get_room_details(match_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["id"]
    match = db.get_by_id("matches", match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not user.get("is_admin", False):
        registration = db.find_one(
            "tournament_registrations",
            lambda r: r.get("tournament_id") == match["tournament_id"] and
                      (r.get("user_id") == user_id or user_id in r.get("member_ids", []))
        )
        if not registration:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not a registered participant in this tournament."
            )

        if not match.get("is_room_published", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Room details have not been released yet. Please wait for room host."
            )

    return {
        "match_id": match["id"],
        "tournament_id": match["tournament_id"],
        "match_number": match.get("match_number"),
        "map": match.get("map"),
        "room_id": match.get("room_id"),
        "room_password": match.get("room_password"),
        "instructions": "Enter Free Fire MAX -> Custom Room -> Search Room ID -> Enter Password. Take screenshot of end screen.",
        "status": match.get("status")
    }

@router.post("/{match_id}/check-in")
def check_in_player(match_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["id"]
    match = db.get_by_id("matches", match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    registration = db.find_one(
        "tournament_registrations",
        lambda r: r.get("tournament_id") == match["tournament_id"] and
                  (r.get("user_id") == user_id or user_id in r.get("member_ids", []))
    )
    if not registration:
        raise HTTPException(status_code=400, detail="Not registered for this tournament")

    db.update("tournament_registrations", registration["id"], {"checked_in": True})
    return {"message": "Check-in successful! Stay tuned for Room ID and Password."}
