from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from backend.app.services.supabase_service import supabase_service
from backend.app.models.schemas import PendingResolution, ResolutionDecision
from backend.app.models.auth import OfficerProfile, OfficerRole
from backend.app.api.v1.endpoints.auth import require_role

router = APIRouter()

@router.get("/pending", response_model=List[PendingResolution])
def get_pending_resolutions():
    """Returns all pending entity resolution candidates awaiting HITL officer review."""
    return supabase_service.pending_resolutions

@router.post("/decision")
def submit_resolution_decision(
    decision: ResolutionDecision,
    officer: OfficerProfile = Depends(require_role([OfficerRole.STATION_ADMIN, OfficerRole.SUPER_ADMIN]))
) -> Dict[str, Any]:
    """Applies an authorized officer's decision (MERGE or REJECT) with live atomic graph collapse."""
    return supabase_service.apply_merge_decision(
        candidate_id=decision.candidate_id,
        action=decision.action,
        officer_id=officer.badge_id,
        notes=decision.notes or "",
        officer_name=officer.name,
        officer_rank=officer.rank
    )
