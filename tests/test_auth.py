import tempfile
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.database import JSONDatabaseManager
import backend.database as db_mod
from backend.routers.auth import router as auth_router
from backend.routers.player import router as player_router

@pytest.fixture
def test_app():
    with tempfile.TemporaryDirectory() as tmpdir:
        test_db = JSONDatabaseManager(data_dir=tmpdir)
        orig_db = db_mod.db
        db_mod.db = test_db

        app = FastAPI()
        app.include_router(auth_router, prefix="/api/v1")
        app.include_router(player_router, prefix="/api/v1")
        client = TestClient(app)
        yield client
        db_mod.db = orig_db

def test_auth_registration_and_login_flow(test_app):
    res = test_app.post("/api/v1/auth/register", json={
        "email": "player@booyahesports.in",
        "password": "short",
        "confirm_password": "short"
    })
    assert res.status_code == 422

    res = test_app.post("/api/v1/auth/register", json={
        "email": "Player@BooyahEsports.in ",
        "password": "12345678",
        "confirm_password": "12345678"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "player@booyahesports.in"
    token = data["access_token"]

    res = test_app.post("/api/v1/auth/login", json={
        "email": "player@booyahesports.in",
        "password": "12345678"
    })
    assert res.status_code == 200

    res = test_app.patch("/api/v1/player/me", json={
        "free_fire_uid": "9876543210",
        "free_fire_nickname": "BooyahKing"
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["profile"]["free_fire_uid"] == "9876543210"
