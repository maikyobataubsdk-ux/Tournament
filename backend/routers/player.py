from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db, utcnow_iso
from backend.schemas import PlayerProfileUpdate
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/player", tags=["Player"])

@router.get("/me")
def get_my_profile(user: dict = Depends(get_current_user)):
    db = get_db()
    profile = db.find_one("player_profiles", lambda p: p.get("user_id") == user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    user_sanitized = {k: v for k, v in user.items() if k != "password_hash"}
    return {
        "user": user_sanitized,
        "profile": profile
    }

@router.patch("/me")
def update_my_profile(update: PlayerProfileUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    profile = db.find_one("player_profiles", lambda p: p.get("user_id") == user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    updated_profile = db.update("player_profiles", profile["id"], update_dict)
    return {"profile": updated_profile, "message": "Profile updated successfully"}

@router.get("/history")
def get_player_history(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    db = get_db()
    registrations = db.find("tournament_registrations", lambda r: r.get("user_id") == user_id or user_id in r.get("member_ids", []))
    tournament_ids = {r.get("tournament_id") for r in registrations}
    tournaments = [t for t in db.get_all("tournaments") if t["id"] in tournament_ids]

    results = db.find("match_results", lambda m: m.get("participant_id") == user_id or user_id in m.get("member_ids", []))
    return {
        "tournaments": tournaments,
        "results": results,
    }

@router.get("/notifications")
def get_player_notifications(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    notes = get_db().find("notifications", lambda n: n.get("user_id") == user_id or n.get("is_broadcast", False))
    notes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return notes
