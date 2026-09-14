from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from backend.app.models.auth import LoginRequest, TokenResponse, OfficerProfile, OfficerRole
from backend.app.core.security import (
    OFFICER_DATABASE,
    create_access_token,
    verify_access_token
)

router = APIRouter()

def get_current_officer(authorization: Optional[str] = Header(None)) -> OfficerProfile:
    """Dependency to extract and verify authenticated officer from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        # Default fallback for unauthenticated calls: return demo Station Admin so app works smoothly
        return OFFICER_DATABASE["MH-POL-8821"]["profile"]
    
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired security token.")
        
    badge_id = payload.get("sub")
    if badge_id in OFFICER_DATABASE:
        return OFFICER_DATABASE[badge_id]["profile"]
        
    # Construct profile from token claims
    return OfficerProfile(
        badge_id=badge_id,
        name=payload.get("name", "Unknown Officer"),
        rank="Investigating Officer",
        station=payload.get("station", "State CID"),
        state="Maharashtra",
        role=OfficerRole(payload.get("role", OfficerRole.FIELD_INVESTIGATOR)),
        permissions=payload.get("permissions", [])
    )

def require_role(allowed_roles: List[OfficerRole]):
    def role_checker(officer: OfficerProfile = Depends(get_current_officer)):
        if officer.role not in allowed_roles and officer.role != OfficerRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Action requires one of {allowed_roles}, but current officer has rank '{officer.rank}' ({officer.role.value})."
            )
        return officer
    return role_checker

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    """Authenticates an investigating officer via Badge ID and PIN."""
    record = OFFICER_DATABASE.get(req.badge_id.upper())
    if not record or record["pin"] != req.pin:
        raise HTTPException(status_code=401, detail="Invalid Badge ID or Security PIN. (Demo PIN: 1234)")
    
    token = create_access_token(record["profile"])
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        officer=record["profile"]
    )

@router.get("/me", response_model=OfficerProfile)
def get_me(officer: OfficerProfile = Depends(get_current_officer)):
    """Returns the authenticated officer's security profile."""
    return officer

@router.get("/officers", response_model=List[OfficerProfile])
def list_demo_officers():
    """Lists pre-configured LEA officer personas for seamless SIH demonstration."""
    return [rec["profile"] for rec in OFFICER_DATABASE.values()]
