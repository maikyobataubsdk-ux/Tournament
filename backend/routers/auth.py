import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status, Security
from fastapi.security import HTTPAuthorizationCredentials

from backend.database import get_db, utcnow_iso
from backend.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    ChangePasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from backend.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    security_scheme,
    check_login_lockout,
    record_failed_attempt,
    clear_failed_attempts,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = get_db().get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.get("is_suspended", False) or user.get("is_banned", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or banned")

    session_version = user.get("session_version", 1)
    if payload.get("session_version", 1) < session_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has been revoked")

    return user

def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    user = get_current_user(credentials)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user

@router.post("/register", response_model=TokenResponse)
def register_user(req: UserRegisterRequest):
    db = get_db()
    settings = db.get_all("settings")
    if settings and not settings[0].get("registration_enabled", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is currently disabled by administrator."
        )

    existing_user = db.find_one("users", lambda u: u.get("email") == req.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pwd_hash = hash_password(req.password)

    user_doc = {
        "id": user_id,
        "email": req.email,
        "email_verified": False,
        "password_hash": pwd_hash,
        "password_changed_at": utcnow_iso(),
        "is_admin": False,
        "is_suspended": False,
        "is_banned": False,
        "session_version": 1,
        "last_login_at": utcnow_iso(),
        "created_at": utcnow_iso(),
    }
    db.insert("users", user_doc)

    profile_doc = {
        "id": f"prof_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "player_name": req.email.split("@")[0],
        "email": req.email,
        "free_fire_uid": "",
        "free_fire_nickname": "",
        "region": "India",
        "avatar_url": "",
        "account_status": "ACTIVE",
        "total_tournaments": 0,
        "total_matches": 0,
        "total_kills": 0,
        "total_points": 0,
        "total_wins": 0,
        "earned_badges": ["ROOKIE"],
        "created_at": utcnow_iso(),
    }
    db.insert("player_profiles", profile_doc)

    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "USER_REGISTERED",
        "target_user_id": user_id,
        "details": f"Registered email: {req.email}",
        "timestamp": utcnow_iso(),
    })

    token = create_access_token({"sub": user_id, "session_version": 1, "is_admin": False})
    user_sanitized = {k: v for k, v in user_doc.items() if k != "password_hash"}
    user_sanitized["profile"] = profile_doc

    return {"access_token": token, "token_type": "bearer", "user": user_sanitized}

@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest):
    check_login_lockout(req.email)

    db = get_db()
    user = db.find_one("users", lambda u: u.get("email") == req.email)
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        record_failed_attempt(req.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    clear_failed_attempts(req.email)

    if user.get("is_suspended", False) or user.get("is_banned", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or banned")

    db.update("users", user["id"], {"last_login_at": utcnow_iso()})
    profile = db.find_one("player_profiles", lambda p: p.get("user_id") == user["id"])

    token = create_access_token({
        "sub": user["id"],
        "session_version": user.get("session_version", 1),
        "is_admin": user.get("is_admin", False),
        "admin_role": user.get("admin_role", None)
    })

    user_sanitized = {k: v for k, v in user.items() if k != "password_hash"}
    user_sanitized["profile"] = profile

    return {"access_token": token, "token_type": "bearer", "user": user_sanitized}

@router.post("/logout")
def logout_user(user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    if not verify_password(req.old_password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")

    db = get_db()
    new_hash = hash_password(req.new_password)
    new_session_version = user.get("session_version", 1) + 1
    db.update("users", user["id"], {
        "password_hash": new_hash,
        "password_changed_at": utcnow_iso(),
        "session_version": new_session_version,
    })

    db.insert("audit_logs", {
        "id": f"aud_{uuid.uuid4().hex[:12]}",
        "action": "USER_CHANGED_PASSWORD",
        "target_user_id": user["id"],
        "details": "User changed their own password",
        "timestamp": utcnow_iso(),
    })

    return {"message": "Password changed successfully. Please log in again with your new password."}

@router.post("/reset-request")
def reset_request(req: ResetPasswordRequest):
    ticket_id = f"tkt_{uuid.uuid4().hex[:12]}"
    get_db().insert("support_tickets", {
        "id": ticket_id,
        "user_email": req.email,
        "type": "PASSWORD_RESET",
        "status": "OPEN",
        "message": f"Administrator-assisted password reset request for {req.email}",
        "created_at": utcnow_iso(),
    })
    return {
        "message": "Password reset request submitted. A Booyahesports administrator will review your account recovery."
    }
