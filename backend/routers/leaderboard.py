from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from backend.database import get_db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/global")
def get_global_leaderboard(limit: int = Query(50, ge=1, le=100)):
    db = get_db()
    profiles = db.get_all("player_profiles")

    ranked = sorted(
        profiles,
        key=lambda p: (p.get("total_points", 0), p.get("total_wins", 0), p.get("total_kills", 0)),
        reverse=True
    )

    results = []
    for rank, p in enumerate(ranked[:limit], start=1):
        results.append({
            "rank": rank,
            "player_id": p.get("user_id"),
            "player_name": p.get("player_name"),
            "free_fire_nickname": p.get("free_fire_nickname") or p.get("player_name"),
            "matches_played": p.get("total_matches", 0),
            "wins": p.get("total_wins", 0),
            "eliminations": p.get("total_kills", 0),
            "total_points": p.get("total_points", 0),
            "avatar_url": p.get("avatar_url", ""),
            "region": p.get("region", "India"),
        })

    return results

@router.get("/tournament/{tournament_id}")
def get_tournament_leaderboard(tournament_id: str):
    db = get_db()
    results = db.find("match_results", lambda r: r.get("tournament_id") == tournament_id and r.get("status") == "APPROVED")

    aggregated: Dict[str, Dict[str, Any]] = {}
    for r in results:
        p_id = r["participant_id"]
        if p_id not in aggregated:
            aggregated[p_id] = {
                "participant_id": p_id,
                "participant_name": r["participant_name"],
                "matches_played": 0,
                "total_kills": 0,
                "placement_points": 0,
                "elimination_points": 0,
                "total_points": 0,
                "wins": 0,
            }
        agg = aggregated[p_id]
        agg["matches_played"] += 1
        agg["total_kills"] += r.get("eliminations", 0)
        agg["placement_points"] += r.get("placement_points", 0)
        agg["elimination_points"] += r.get("elimination_points", 0)
        agg["total_points"] += r.get("total_points", 0)
        if r.get("position") == 1:
            agg["wins"] += 1

    sorted_standings = sorted(
        aggregated.values(),
        key=lambda x: (x["total_points"], x["wins"], x["total_kills"]),
        reverse=True
    )

    for rank, item in enumerate(sorted_standings, start=1):
        item["rank"] = rank

    return sorted_standings
