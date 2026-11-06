import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db, utcnow_iso
from backend.schemas import TeamCreateRequest, TeamInviteRequest
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_team(req: TeamCreateRequest, user: dict = Depends(get_current_user)):
    user_id = user["id"]
    team_id = f"tm_{uuid.uuid4().hex[:12]}"

    team_doc = {
        "id": team_id,
        "name": req.name,
        "logo_url": req.logo_url or "/assets/default_team.png",
        "description": req.description or "",
        "captain_id": user_id,
        "created_at": utcnow_iso(),
    }
    db = get_db()
    db.insert("teams", team_doc)

    db.insert("team_members", {
        "id": f"tmm_{uuid.uuid4().hex[:12]}",
        "team_id": team_id,
        "user_id": user_id,
        "role": "CAPTAIN",
        "joined_at": utcnow_iso(),
    })

    return team_doc

@router.get("")
def list_teams():
    return get_db().get_all("teams")

@router.get("/{team_id}")
def get_team(team_id: str):
    db = get_db()
    team = db.get_by_id("teams", team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.find("team_members", lambda m: m.get("team_id") == team_id)
    member_user_ids = {m["user_id"] for m in members}
    profiles = [p for p in db.get_all("player_profiles") if p.get("user_id") in member_user_ids]

    return {
        "team": team,
        "members": members,
        "profiles": profiles
    }

@router.post("/{team_id}/invite")
def invite_member(team_id: str, req: TeamInviteRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    team = db.get_by_id("teams", team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if team.get("captain_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Only team captain can invite members")

    invitee = db.find_one("users", lambda u: u.get("email") == req.invitee_email)
    if not invitee:
        raise HTTPException(status_code=404, detail="User with that email not found")

    existing_member = db.find_one("team_members", lambda m: m.get("team_id") == team_id and m.get("user_id") == invitee["id"])
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this team")

    db.insert("team_members", {
        "id": f"tmm_{uuid.uuid4().hex[:12]}",
        "team_id": team_id,
        "user_id": invitee["id"],
        "role": "MEMBER",
        "joined_at": utcnow_iso(),
    })

    db.insert("notifications", {
        "id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": invitee["id"],
        "title": f"Invited to Team {team['name']}",
        "message": f"You were added to team {team['name']} by captain.",
        "is_read": False,
        "is_broadcast": False,
        "created_at": utcnow_iso(),
    })

    return {"message": "Member invited and joined successfully"}

@router.delete("/{team_id}/members/{target_user_id}")
def remove_member(team_id: str, target_user_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    team = db.get_by_id("teams", team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    caller_id = user["id"]
    if caller_id != target_user_id and caller_id != team.get("captain_id"):
        raise HTTPException(status_code=403, detail="Not authorized to remove member")

    if target_user_id == team.get("captain_id"):
        raise HTTPException(status_code=400, detail="Captain cannot leave without transferring captaincy")

    member = db.find_one("team_members", lambda m: m.get("team_id") == team_id and m.get("user_id") == target_user_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in team")

    db.delete("team_members", member["id"])
    return {"message": "Member removed successfully"}
