import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import get_db, utcnow_iso
from backend.routers.auth import router as auth_router
from backend.routers.player import router as player_router
from backend.routers.tournaments import router as tournament_router
from backend.routers.teams import router as team_router
from backend.routers.matches import router as match_router
from backend.routers.results import router as results_router
from backend.routers.leaderboard import router as leaderboard_router
from backend.routers.app_releases import router as app_releases_router, RELEASES_DIR
from backend.routers.notifications import router as notifications_router
from backend.routers.announcements import router as announcements_router
from backend.routers.admin import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("booyahesports")

app = FastAPI(
    title="Booyahesports Free Fire MAX Tournament API",
    description="Official REST API for Booyahesports tournament management, player profiles, and APK releases.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_and_maintenance_middleware(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.include_router(auth_router, prefix="/api/v1")
app.include_router(player_router, prefix="/api/v1")
app.include_router(tournament_router, prefix="/api/v1")
app.include_router(team_router, prefix="/api/v1")
app.include_router(match_router, prefix="/api/v1")
app.include_router(results_router, prefix="/api/v1")
app.include_router(leaderboard_router, prefix="/api/v1")
app.include_router(app_releases_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(announcements_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

RELEASES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/releases", StaticFiles(directory=str(RELEASES_DIR)), name="releases")

assets_dir = Path("/app/assets" if os.path.exists("/app/assets") else str(Path(__file__).resolve().parent.parent / "assets"))
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
def root():
    return {
        "platform": "Booyahesports",
        "domain": "Booyahesports.in",
        "service": "Free Fire MAX Esports Tournament Engine",
        "api_docs": "/api/docs",
        "health": "/api/v1/app/health"
    }

@app.on_event("startup")
def init_superadmin():
    db = get_db()
    superadmin_email = os.getenv("ADMIN_EMAIL", "admin@booyahesports.in").lower()
    existing_admin = db.find_one("users", lambda u: u.get("is_admin", False))
    if not existing_admin:
        from backend.security import hash_password
        logger.info("Creating initial Super Admin account: %s", superadmin_email)
        admin_doc = {
            "id": "usr_superadmin_01",
            "email": superadmin_email,
            "email_verified": True,
            "password_hash": hash_password(os.getenv("ADMIN_INITIAL_PASSWORD", "12345678")),
            "password_changed_at": utcnow_iso(),
            "is_admin": True,
            "admin_role": "super_admin",
            "is_suspended": False,
            "is_banned": False,
            "session_version": 1,
            "created_at": utcnow_iso(),
        }
        db.insert("users", admin_doc)
        db.insert("player_profiles", {
            "id": "prof_superadmin",
            "user_id": "usr_superadmin_01",
            "player_name": "BooyahAdmin",
            "email": superadmin_email,
            "free_fire_uid": "00000000",
            "free_fire_nickname": "BooyahAdmin",
            "region": "India",
            "account_status": "ACTIVE",
            "total_tournaments": 0,
            "total_matches": 0,
            "total_kills": 0,
            "total_points": 0,
            "total_wins": 0,
            "earned_badges": ["ADMIN"],
            "created_at": utcnow_iso(),
        })
