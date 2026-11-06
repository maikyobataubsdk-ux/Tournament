import re
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    confirm_password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = v.strip()
        if not (len(v) == 8 and v.isdigit()):
            raise ValueError("Password must contain exactly 8 numeric digits")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Confirm password does not match password")
        return v


class UserLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = v.strip()
        if not (len(v) == 8 and v.isdigit()):
            raise ValueError("Password must be exactly 8 numeric digits")
        return v


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_pwd(cls, v: str) -> str:
        v = v.strip()
        if not (len(v) == 8 and v.isdigit()):
            raise ValueError("Password must contain exactly 8 numeric digits")
        return v

    @field_validator("confirm_new_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class ResetPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class AdminResetPasswordRequest(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_pwd(cls, v: str) -> str:
        v = v.strip()
        if not (len(v) == 8 and v.isdigit()):
            raise ValueError("Password must contain exactly 8 numeric digits")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class PlayerProfileUpdate(BaseModel):
    player_name: Optional[str] = None
    free_fire_uid: Optional[str] = None
    free_fire_nickname: Optional[str] = None
    region: Optional[str] = None
    avatar_url: Optional[str] = None


class TeamCreateRequest(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None


class TeamInviteRequest(BaseModel):
    invitee_email: str

    @field_validator("invitee_email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class TournamentCreateRequest(BaseModel):
    title: str
    description: str
    mode: str = Field(..., description="Solo, Duo, Squad, Clash Squad")
    map: str = Field(default="Bermuda", description="Bermuda, Purgatory, Kalahari, Alpine, Nexterra")
    thumbnail_url: Optional[str] = None
    max_slots: int = 48
    tournament_date: str
    registration_start: str
    registration_deadline: str
    rules: Optional[str] = "Standard Free Fire MAX Competitive Rules. No emulators, no hacks."
    scoring_config: Optional[Dict[str, Any]] = None
    status: Optional[str] = "PUBLISHED"


class TournamentUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[str] = None
    map: Optional[str] = None
    thumbnail_url: Optional[str] = None
    max_slots: Optional[int] = None
    tournament_date: Optional[str] = None
    registration_start: Optional[str] = None
    registration_deadline: Optional[str] = None
    rules: Optional[str] = None
    scoring_config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class TournamentRegisterRequest(BaseModel):
    team_id: Optional[str] = None


class MatchCreateRequest(BaseModel):
    tournament_id: str
    match_number: int
    scheduled_at: str
    map: str = "Bermuda"
    room_id: Optional[str] = None
    room_password: Optional[str] = None
    release_credentials_at: Optional[str] = None


class RoomCredentialsUpdateRequest(BaseModel):
    room_id: str
    room_password: str
    release_now: bool = False
    release_credentials_at: Optional[str] = None


class ResultEntry(BaseModel):
    participant_id: str
    participant_name: str
    position: int
    eliminations: int
    evidence_url: Optional[str] = None
    referee_comments: Optional[str] = None


class MatchResultsSubmitRequest(BaseModel):
    tournament_id: str
    match_id: str
    results: List[ResultEntry]


class DisputeSubmitRequest(BaseModel):
    tournament_id: str
    match_id: str
    reason: str
    evidence_url: Optional[str] = None


class AppReleaseCreateRequest(BaseModel):
    version_name: str
    version_code: int
    minimum_supported_version: int
    mandatory: bool = False
    release_notes: str
    download_url: Optional[str] = None
    sha256: Optional[str] = None
    is_published: bool = False


class AdminUserCreateRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "tournament_manager"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = v.strip()
        if not (len(v) == 8 and v.isdigit()):
            raise ValueError("Password must be exactly 8 numeric digits")
        return v


class SettingsUpdateRequest(BaseModel):
    site_title: Optional[str] = None
    domain: Optional[str] = None
    contact_email: Optional[str] = None
    banner_title: Optional[str] = None
    banner_subtitle: Optional[str] = None
    discord_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    registration_enabled: Optional[bool] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    points_system: Optional[Dict[str, Any]] = None
