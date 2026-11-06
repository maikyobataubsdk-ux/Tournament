import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("JWT_SECRET", "booyahesports_super_secret_jwt_key_2025_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "jti": secrets.token_hex(16)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

FAILED_ATTEMPTS: Dict[str, list] = {}
LOCKOUT_DURATION_SECONDS = 300
MAX_FAILED_ATTEMPTS = 5

def check_login_lockout(email: str):
    email = email.lower()
    now = datetime.now(timezone.utc).timestamp()
    attempts = FAILED_ATTEMPTS.get(email, [])
    valid_attempts = [ts for ts in attempts if now - ts < LOCKOUT_DURATION_SECONDS]
    FAILED_ATTEMPTS[email] = valid_attempts

    if len(valid_attempts) >= MAX_FAILED_ATTEMPTS:
        wait_time = int(LOCKOUT_DURATION_SECONDS - (now - valid_attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to multiple failed login attempts. Try again in {max(1, wait_time)} seconds."
        )

def record_failed_attempt(email: str):
    email = email.lower()
    now = datetime.now(timezone.utc).timestamp()
    if email not in FAILED_ATTEMPTS:
        FAILED_ATTEMPTS[email] = []
    FAILED_ATTEMPTS[email].append(now)

def clear_failed_attempts(email: str):
    email = email.lower()
    FAILED_ATTEMPTS.pop(email, None)
