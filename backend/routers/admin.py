import io
import csv
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response

from backend.database import get_db, utcnow_iso
from backend.schemas import (
    AdminUserCreateRequest,
    AdminResetPasswordRequest,
    SettingsUpdateRequest,
)
from backend.security import hash_password
from backend.routers.auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Portal API"])

@router.get("/metrics")
def get_dashboard_metrics(admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    users = db.get_all("users")
    tournaments = db.get_all("tournaments")
    teams = db.get_all("teams")
    registrations = db.get_all("tournament_registrations")
    matches = db.get_all("matches")
    disputes = db.get_all("disputes")
    releases = db.get_all("app_releases")

    active_players = [u for u in users if not u.get("is_suspended") and not u.get("is_banned")]
    suspended_players = [u for u in users if u.get("is_suspended") or u.get("is_banned")]

    upcoming_tourneys = [t for t in tournaments if t.get("status") in ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_FULL", "CHECK_IN"]]
    live_tourneys = [t for t in tournaments if t.get("status") == "LIVE"]
    completed_tourneys = [t for t in tournaments if t.get("status") == "COMPLETED"]

    pending_results = [m for m in matches if m.get("status") in ["LIVE", "RESULTS_PENDING"]]
    open_disputes = [d for d in disputes if d.get("status") == "OPEN"]

    latest_release = max(releases, key=lambda r: r.get("version_code", 0)) if releases else None

    recent_registrations = registrations[-10:] if registrations else []
    recent_disputes = open_disputes[-5:] if open_disputes else []
    upcoming_matches = [m for m in matches if m.get("status") in ["SCHEDULED", "ROOM_OPEN"]][:5]
    recent_audit_logs = db.get_all("audit_logs")[-15:]

    return {
        "total_players": len(users),
        "active_players": len(active_players),
        "suspended_players": len(suspended_players),
        "total_teams": len(teams),
        "total_tournaments": len(tournaments),
        "upcoming_tournaments": len(upcoming_tourneys),
        "live_tournaments": len(live_tourneys),
        "completed_tournaments": len(completed_tourneys),
        "total_registrations": len(registrations),
        "pending_results": len(pending_results),
        "open_disputes": len(open_disputes),
        "latest_app_version": latest_release.get("version_name") if latest_release else "1.0.0",
        "recent_registrations": recent_registrations,
        "recent_disputes": recent_disputes,
        "upcoming_matches": upcoming_matches,
        "recent_audit_logs": list(reversed(recent_audit_logs)),
    }

@router.get("/players")
def list_players(search: Optional[str] = None, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    users = db.get_all("users")
    profiles = {p.get("user_id"): p for p in db.get_all("player_profiles")}

    results = []
    for u in users:
        p = profiles.get(u["id"], {})
        email = u.get("email", "")
        p_name = p.get("player_name", "")
        uid = p.get("free_fire_uid", "")

        if search:
            q = search.lower()
            if q not in email.lower() and q not in p_name.lower() and q not in uid.lower():
                continue

        user_info = {
            "id": u["id"],
            "email": email,
            "email_verified": u.get("email_verified", False),
            "is_suspended": u.get("is_suspended", False),
            "is_banned": u.get("is_banned", False),
            "password_changed_at": u.get("password_changed_at"),
            "last_login_at": u.get("last_login_at"),
            "created_at": u.get("created_at"),
            "profile": p,
        }
        results.append(user_info)
    return results

@router.post("/players/{user_id}/suspend")
def suspend_player(user_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    user = db.get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")

    db.update("users", user_id, {"is_suspended": True})
    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "PLAYER_SUSPENDED",
        "performed_by": admin["id"],
        "target_id": user_id,
        "details": f"Player {user.get('email')} suspended",
        "timestamp": utcnow_iso(),
    })
    return {"message": "Player suspended successfully"}

@router.post("/players/{user_id}/unsuspend")
def unsuspend_player(user_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    user = db.get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")

    db.update("users", user_id, {"is_suspended": False})
    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "PLAYER_UNSUSPENDED",
        "performed_by": admin["id"],
        "target_id": user_id,
        "details": f"Player {user.get('email')} unsuspended",
        "timestamp": utcnow_iso(),
    })
    return {"message": "Player unsuspended successfully"}

@router.post("/players/{user_id}/reset-password")
def admin_reset_password(user_id: str, req: AdminResetPasswordRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    user = db.get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")

    new_hash = hash_password(req.new_password)
    new_session_version = user.get("session_version", 1) + 1
    db.update("users", user_id, {
        "password_hash": new_hash,
        "password_changed_at": utcnow_iso(),
        "session_version": new_session_version,
    })

    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "ADMIN_RESET_PASSWORD",
        "performed_by": admin["id"],
        "target_id": user_id,
        "details": f"Admin reset password for player {user.get('email')}",
        "timestamp": utcnow_iso(),
    })
    return {"message": "Password reset successfully. User sessions have been revoked."}

@router.post("/players/{user_id}/revoke-sessions")
def revoke_sessions(user_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    user = db.get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")

    db.update("users", user_id, {
        "session_version": user.get("session_version", 1) + 1
    })
    return {"message": "All active sessions revoked for user."}

@router.get("/tournaments/{tournament_id}/export")
def export_tournament_participants(tournament_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    tourney = db.get_by_id("tournaments", tournament_id)
    if not tourney:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registrations = db.find("tournament_registrations", lambda r: r.get("tournament_id") == tournament_id)
    profiles = {p.get("user_id"): p for p in db.get_all("player_profiles")}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration ID", "Tournament ID", "Tournament Title", "Participant Name", "User ID", "Free Fire UID", "Registered At", "Checked In"])

    for r in registrations:
        p = profiles.get(r.get("user_id"), {})
        writer.writerow([
            r.get("id"),
            tournament_id,
            tourney.get("title"),
            r.get("participant_name"),
            r.get("user_id"),
            p.get("free_fire_uid", ""),
            r.get("registered_at"),
            r.get("checked_in", False),
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=participants_{tournament_id}.csv"}
    )

@router.get("/settings")
def get_settings():
    db = get_db()
    settings_list = db.get_all("settings")
    if not settings_list:
        return {}
    return settings_list[0]

@router.patch("/settings")
def update_settings(req: SettingsUpdateRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    settings_list = db.get_all("settings")
    current_settings = settings_list[0] if settings_list else {}

    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    current_settings.update(updates)

    def _save_settings(data):
        data["settings"] = [current_settings]
        data["audit_logs"].append({
            "id": f"aud_{uuid.uuid4().hex[:12]}",
            "action": "SETTINGS_UPDATED",
            "performed_by": admin["id"],
            "details": f"Updated settings: {list(updates.keys())}",
            "timestamp": utcnow_iso(),
        })
        return current_settings

    saved = db.transaction(_save_settings)
    return {"message": "Settings updated successfully", "settings": saved}

@router.get("/backups")
def list_backups(admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    return db.list_backups()

@router.post("/backups/create")
def create_backup(tag: str = "manual", admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    backup_file = db.create_backup(tag=tag)
    return {"message": "Backup created successfully", "filename": backup_file.name}

@router.post("/backups/restore")
def restore_backup(filename: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    success = db.restore_backup(filename)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to restore backup")
    return {"message": f"Successfully restored database from {filename}"}

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    logs = db.get_all("audit_logs")
    return list(reversed(logs))[:limit]

@router.get("/tickets")
def list_tickets(admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    tickets = db.get_all("support_tickets")
    return list(reversed(tickets))

@router.patch("/tickets/{ticket_id}/resolve")
def resolve_ticket(ticket_id: str, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    updated = db.update("support_tickets", ticket_id, {"status": "RESOLVED", "resolved_by": admin["id"]})
    return {"message": "Ticket resolved", "ticket": updated}
