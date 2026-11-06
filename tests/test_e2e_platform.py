import io
import tempfile
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import JSONDatabaseManager
import backend.database as db_mod
from backend.security import create_access_token

@pytest.fixture
def e2e_client():
    with tempfile.TemporaryDirectory() as tmpdir:
        test_db = JSONDatabaseManager(data_dir=tmpdir)
        orig_db = db_mod.db
        db_mod.db = test_db

        client = TestClient(app)
        yield client, test_db
        db_mod.db = orig_db

def test_full_platform_lifecycle_e2e(e2e_client):
    client, test_db = e2e_client

    # 1. Healthcheck
    h_res = client.get("/api/v1/app/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "healthy"

    # 2. Superadmin account seeding
    test_db.insert("users", {
        "id": "admin_master",
        "email": "admin@booyahesports.in",
        "is_admin": True,
        "is_suspended": False,
        "is_banned": False,
        "session_version": 1
    })
    admin_token = create_access_token({"sub": "admin_master", "session_version": 1, "is_admin": True})

    # 3. Player Registration
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "topfragger@booyahesports.in",
        "password": "77778888",
        "confirm_password": "77778888"
    })
    assert reg_res.status_code == 200
    p_data = reg_res.json()
    player_token = p_data["access_token"]
    player_id = p_data["user"]["id"]

    # 4. Player Updates Free Fire UID
    prof_res = client.patch("/api/v1/player/me", json={
        "player_name": "SniperGod",
        "free_fire_uid": "9988776655",
        "free_fire_nickname": "Booyah_Sniper"
    }, headers={"Authorization": f"Bearer {player_token}"})
    assert prof_res.status_code == 200
    assert prof_res.json()["profile"]["free_fire_uid"] == "9988776655"

    # 5. Admin creates Free Fire MAX Squad tournament
    t_res = client.post("/api/v1/tournaments", json={
        "title": "Booyah Grand Championship 2025",
        "description": "Official community championship with verified custom rooms.",
        "mode": "Solo",
        "map": "Bermuda",
        "max_slots": 48,
        "tournament_date": "2025-06-01T15:00:00Z",
        "registration_start": "2025-05-01T00:00:00Z",
        "registration_deadline": "2025-05-31T23:59:59Z",
        "status": "PUBLISHED"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert t_res.status_code == 201
    tournament_id = t_res.json()["id"]

    # 6. Admin creates match #1 with secret room credentials
    m_res = client.post("/api/v1/matches", json={
        "tournament_id": tournament_id,
        "match_number": 1,
        "scheduled_at": "2025-06-01T15:30:00Z",
        "room_id": "CR_992144",
        "room_password": "BOOYAH_SECRET_PASS"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert m_res.status_code == 201
    match_id = m_res.json()["id"]

    # 7. Player registers for tournament
    join_res = client.post(f"/api/v1/tournaments/{tournament_id}/register", json={}, headers={"Authorization": f"Bearer {player_token}"})
    assert join_res.status_code == 200

    # 8. Room details forbidden before release
    early_res = client.get(f"/api/v1/matches/{match_id}/room-details", headers={"Authorization": f"Bearer {player_token}"})
    assert early_res.status_code == 403

    # 9. Admin releases room credentials
    client.patch(f"/api/v1/matches/{match_id}/room-credentials", json={
        "room_id": "CR_992144",
        "room_password": "BOOYAH_SECRET_PASS",
        "release_now": True
    }, headers={"Authorization": f"Bearer {admin_token}"})

    # 10. Registered player accesses room credentials
    auth_room_res = client.get(f"/api/v1/matches/{match_id}/room-details", headers={"Authorization": f"Bearer {player_token}"})
    assert auth_room_res.status_code == 200
    assert auth_room_res.json()["room_id"] == "CR_992144"
    assert auth_room_res.json()["room_password"] == "BOOYAH_SECRET_PASS"

    # 11. Match finishes: Referee enters scores (1st place + 6 kills)
    sub_res = client.post("/api/v1/results/submit", json={
        "tournament_id": tournament_id,
        "match_id": match_id,
        "results": [
            {
                "participant_id": player_id,
                "participant_name": "SniperGod",
                "position": 1,
                "eliminations": 6
            }
        ]
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert sub_res.status_code == 200
    # 1st place = 12 pts, 6 kills * 1 = 6 pts -> total 18 pts
    assert sub_res.json()[0]["total_points"] == 18

    # 12. Check global leaderboard updates
    lb_res = client.get("/api/v1/leaderboard/global")
    assert lb_res.status_code == 200
    leaders = lb_res.json()
    assert len(leaders) >= 1
    assert leaders[0]["player_name"] == "SniperGod"
    assert leaders[0]["total_points"] == 18

    # 13. Admin checks dashboard metrics
    metrics_res = client.get("/api/v1/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_players"] >= 2
    assert metrics["total_tournaments"] >= 1
    assert metrics["total_registrations"] >= 1

    # 14. Admin APK release publishing
    apk_data = io.BytesIO(b"PK\x03\x04FAKE_ANDROID_PACKAGE_BINARY_DATA")
    rel_res = client.post("/api/v1/app/releases/upload", data={
        "version_name": "1.0.2",
        "version_code": 3,
        "minimum_supported_version": 2,
        "mandatory": "false",
        "release_notes": "Official production release with verified custom room anti-cheat engine.",
        "publish_now": "true",
    }, files={"file": ("booyahesports_v1.0.2.apk", apk_data, "application/vnd.android.package-archive")},
    headers={"Authorization": f"Bearer {admin_token}"})
    assert rel_res.status_code == 200

    # 15. Android app checks latest version on startup
    latest_app_res = client.get("/api/v1/app/latest")
    assert latest_app_res.status_code == 200
    assert latest_app_res.json()["version_name"] == "1.0.2"
    assert latest_app_res.json()["version_code"] == 3
    assert len(latest_app_res.json()["sha256"]) == 64
