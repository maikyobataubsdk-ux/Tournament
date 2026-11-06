import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db, utcnow_iso
from backend.schemas import MatchResultsSubmitRequest, DisputeSubmitRequest
from backend.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/results", tags=["Results & Disputes"])

@router.get("")
def list_results(tournament_id: Optional[str] = None):
    db = get_db()
    if tournament_id:
        return db.find("match_results", lambda r: r.get("tournament_id") == tournament_id)
    return db.get_all("match_results")

@router.get("/{result_id}")
def get_result(result_id: str):
    res = get_db().get_by_id("match_results", result_id)
    if not res:
        raise HTTPException(status_code=404, detail="Result record not found")
    return res

@router.post("/submit")
def submit_match_results(req: MatchResultsSubmitRequest, admin: dict = Depends(get_current_admin_user)):
    db = get_db()
    tournament = db.get_by_id("tournaments", req.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    match = db.get_by_id("matches", req.match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    scoring_cfg = tournament.get("scoring_config", {})
    placement_table = scoring_cfg.get("placement", {
        "1": 12, "2": 9, "3": 8, "4": 7, "5": 6,
        "6": 5, "7": 4, "8": 3, "9": 2, "10": 1, "11": 0, "12": 0
    })
    per_kill = scoring_cfg.get("per_kill", 1)

    submitted_records = []

    def _atomic_record_results(data):
        for entry in req.results:
            placement_pts = placement_table.get(str(entry.position), 0)
            kill_pts = entry.eliminations * per_kill
            total_pts = placement_pts + kill_pts

            res_id = f"res_{uuid.uuid4().hex[:12]}"
            doc = {
                "id": res_id,
                "tournament_id": req.tournament_id,
                "match_id": req.match_id,
                "participant_id": entry.participant_id,
                "participant_name": entry.participant_name,
                "position": entry.position,
                "eliminations": entry.eliminations,
                "placement_points": placement_pts,
                "elimination_points": kill_pts,
                "total_points": total_pts,
                "evidence_url": entry.evidence_url or "",
                "referee_comments": entry.referee_comments or "",
                "status": "APPROVED",
                "verified_by": admin["id"],
                "created_at": utcnow_iso(),
            }
            data["match_results"].append(doc)
            submitted_records.append(doc)

            for prof in data["player_profiles"]:
                if prof.get("user_id") == entry.participant_id:
                    prof["total_matches"] = prof.get("total_matches", 0) + 1
                    prof["total_kills"] = prof.get("total_kills", 0) + entry.eliminations
                    prof["total_points"] = prof.get("total_points", 0) + total_pts
                    if entry.position == 1:
                        prof["total_wins"] = prof.get("total_wins", 0) + 1
                    break

        for m in data["matches"]:
            if m["id"] == req.match_id:
                m["status"] = "COMPLETED"
                break

        data["audit_logs"].append({
            "id": f"aud_{uuid.uuid4().hex[:12]}",
            "action": "MATCH_RESULTS_APPROVED",
            "performed_by": admin["id"],
            "target_id": req.match_id,
            "details": f"Approved {len(req.results)} results for match {req.match_id}",
            "timestamp": utcnow_iso(),
        })

        return submitted_records

    return db.transaction(_atomic_record_results)

@router.post("/{match_id}/dispute")
def submit_dispute(match_id: str, req: DisputeSubmitRequest, user: dict = Depends(get_current_user)):
    user_id = user["id"]
    db = get_db()

    match = db.get_by_id("matches", match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"
    dispute_doc = {
        "id": dispute_id,
        "tournament_id": req.tournament_id,
        "match_id": match_id,
        "user_id": user_id,
        "reason": req.reason,
        "evidence_url": req.evidence_url or "",
        "status": "OPEN",
        "admin_resolution": "",
        "created_at": utcnow_iso(),
    }
    db.insert("disputes", dispute_doc)

    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "DISPUTE_SUBMITTED",
        "performed_by": user_id,
        "target_id": dispute_id,
        "details": f"Dispute submitted for match {match_id}: {req.reason[:50]}",
        "timestamp": utcnow_iso(),
    })

    return {"message": "Dispute filed successfully. A tournament referee will review it.", "dispute": dispute_doc}
