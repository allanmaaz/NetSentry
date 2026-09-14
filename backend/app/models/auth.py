from enum import Enum
from typing import Optional, List
from pydantic import BaseModel

class OfficerRole(str, Enum):
    FIELD_INVESTIGATOR = "FIELD_INVESTIGATOR"
    STATION_ADMIN = "STATION_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class OfficerProfile(BaseModel):
    badge_id: str
    name: str
    rank: str
    station: str
    state: str
    role: OfficerRole
    permissions: List[str]

class LoginRequest(BaseModel):
    badge_id: str
    pin: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    officer: OfficerProfile
