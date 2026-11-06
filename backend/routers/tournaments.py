import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from backend.database import get_db, utcnow_iso
from backend.schemas import (
    TournamentCreateRequest,
    TournamentUpdateRequest,
    TournamentRegisterRequest,
)
from backend.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

@router.get("")
def list_tournaments(
    status_filter: Optional[str] = Query(None, alias="status"),
    mode_filter: Optional[str] = Query(None, alias="mode"),
    search: Optional[str] = Query(None)
):
    tournaments = get_db().get_all("tournaments")
    results = []
    for t in tournaments:
        if t.get("status") == "DRAFT":
            continue
        if status_filter and t.get("status") != status_filter:
            continue
        if mode_filter and t.get("mode") != mode_filter:
            continue
        if search:
            q = search.lower()
            if q not in t.get("title", "").lower() and q not in t.get("description", "").lower():
                continue
        results.append(t)

    return sorted(results, key=lambda x: x.get("tournament_date", ""), reverse=False)

@router.get("/{tournament_id}")
def get_tournament_details(tournament_id: str):
    db = get_db()
    t = db.get_by_id("tournaments", tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registrations = db.find("tournament_registrations", lambda r: r.get("tournament_id") == tournament_id)
    matches = db.find("matches", lambda m: m.get("tournament_id") == tournament_id)

    sanitized_matches = []
    for m in matches:
        sm = dict(m)
        sm.pop("room_password", None)
        if not sm.get("is_room_published", False):
            sm.pop("room_id", None)
        sanitized_matches.append(sm)

    return {
        "tournament": t,
        "registrations_count": len(registrations),
        "participants": registrations,
        "matches": sanitized_matches,
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_tournament(req: TournamentCreateRequest, admin: dict = Depends(get_current_admin_user)):
    t_id = f"trn_{uuid.uuid4().hex[:12]}"
    tournament_doc = {
        "id": t_id,
        "title": req.title,
        "description": req.description,
        "mode": req.mode,
        "map": req.map,
        "thumbnail_url": req.thumbnail_url or "/assets/default_tournament.jpg",
        "max_slots": req.max_slots,
        "registered_slots": 0,
        "tournament_date": req.tournament_date,
        "registration_start": req.registration_start,
        "registration_deadline": req.registration_deadline,
        "rules": req.rules,
        "scoring_config": req.scoring_config or {
            "placement": {"1": 12, "2": 9, "3": 8, "4": 7, "5": 6, "6": 5, "7": 4, "8": 3, "9": 2, "10": 1, "11": 0, "12": 0},
            "per_kill": 1
        },
        "status": req.status or "PUBLISHED",
        "created_by": admin["id"],
        "created_at": utcnow_iso(),
    }
    get_db().insert("tournaments", tournament_doc)
    return tournament_doc

@router.patch("/{tournament_id}")
def update_tournament(tournament_id: str, req: TournamentUpdateRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    t = db.get_by_id("tournaments", tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    updated = db.update("tournaments", tournament_id, updates)
    return updated

@router.delete("/{tournament_id}")
def delete_tournament(tournament_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    t = db.get_by_id("tournaments", tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if t.get("status") not in ["DRAFT", "CANCELLED"]:
        raise HTTPException(status_code=400, detail="Cannot delete active or completed tournaments")
    db.delete("tournaments", tournament_id)
    return {"message": "Tournament deleted successfully"}

@router.post("/{tournament_id}/register")
def register_for_tournament(tournament_id: str, req: TournamentRegisterRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = user["id"]
    t = db.get_by_id("tournaments", tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    if t.get("status") not in ["PUBLISHED", "REGISTRATION_OPEN"]:
        raise HTTPException(status_code=400, detail=f"Registration is not open for this tournament (Status: {t.get('status')})")

    profile = db.find_one("player_profiles", lambda p: p.get("user_id") == user_id)
    if not profile or not profile.get("free_fire_uid"):
        raise HTTPException(status_code=400, detail="Please set your Free Fire UID in your Profile before registering.")

    def _do_register(data):
        regs = [r for r in data["tournament_registrations"] if r.get("tournament_id") == tournament_id]

        for r in regs:
            if r.get("user_id") == user_id or user_id in r.get("member_ids", []):
                raise HTTPException(status_code=400, detail="You are already registered for this tournament.")

        if len(regs) >= t.get("max_slots", 48):
            raise HTTPException(status_code=400, detail="Tournament slots are full.")

        member_ids = [user_id]
        team_name = profile.get("player_name", "Solo Player")

        if t.get("mode") in ["Duo", "Squad"]:
            if not req.team_id:
                raise HTTPException(status_code=400, detail=f"Team ID is required for {t.get('mode')} tournaments.")
            team = next((tm for tm in data["teams"] if tm.get("id") == req.team_id), None)
            if not team:
                raise HTTPException(status_code=404, detail="Team not found.")
            if team.get("captain_id") != user_id:
                raise HTTPException(status_code=403, detail="Only team captain can register the team.")

            team_members = [tm["user_id"] for tm in data["team_members"] if tm.get("team_id") == req.team_id]
            required_count = 2 if t.get("mode") == "Duo" else 4
            if len(team_members) < required_count:
                raise HTTPException(status_code=400, detail=f"Your team has {len(team_members)} members. {required_count} required for {t.get('mode')}.")

            for m_id in team_members:
                for r in regs:
                    if m_id in r.get("member_ids", []):
                        raise HTTPException(status_code=400, detail=f"Team member {m_id} is already registered in another team for this tournament.")

            member_ids = team_members
            team_name = team.get("name", "Team")

        reg_id = f"reg_{uuid.uuid4().hex[:12]}"
        reg_doc = {
            "id": reg_id,
            "tournament_id": tournament_id,
            "user_id": user_id,
            "team_id": req.team_id,
            "participant_name": team_name,
            "member_ids": member_ids,
            "checked_in": False,
            "registered_at": utcnow_iso(),
        }
        data["tournament_registrations"].append(reg_doc)

        for tourney in data["tournaments"]:
            if tourney["id"] == tournament_id:
                tourney["registered_slots"] = len(regs) + 1
                if tourney["registered_slots"] >= tourney.get("max_slots", 48):
                    tourney["status"] = "REGISTRATION_FULL"
                break

        data["notifications"].append({
            "id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "title": f"Registration Confirmed: {t.get('title')}",
            "message": f"You are successfully registered for {t.get('title')}. Get ready for the Booyah!",
            "is_read": False,
            "is_broadcast": False,
            "created_at": utcnow_iso(),
        })

        return reg_doc

    return get_db().transaction(_do_register)

@router.post("/{tournament_id}/cancel-registration")
def cancel_registration(tournament_id: str, user: dict = Depends(get_current_user)):
    user_id = user["id"]

    def _do_cancel(data):
        reg = next((r for r in data["tournament_registrations"] if r.get("tournament_id") == tournament_id and r.get("user_id") == user_id), None)
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")

        tourney = next((t for t in data["tournaments"] if t.get("id") == tournament_id), None)
        if tourney and tourney.get("status") in ["LIVE", "COMPLETED"]:
            raise HTTPException(status_code=400, detail="Cannot cancel registration for live or completed tournament")

        data["tournament_registrations"] = [r for r in data["tournament_registrations"] if r.get("id") != reg["id"]]
        if tourney:
            tourney["registered_slots"] = max(0, tourney.get("registered_slots", 1) - 1)
            if tourney.get("status") == "REGISTRATION_FULL":
                tourney["status"] = "REGISTRATION_OPEN"

        return {"message": "Registration cancelled successfully"}

    return get_db().transaction(_do_cancel)
