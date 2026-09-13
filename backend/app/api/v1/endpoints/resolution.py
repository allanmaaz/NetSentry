from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.services.supabase_service import supabase_service
from backend.app.models.schemas import PendingResolution, ResolutionDecision

router = APIRouter()

@router.get("/pending", response_model=List[PendingResolution])
def get_pending_resolutions():
    """Returns all pending entity resolution candidates awaiting HITL officer review."""
    return supabase_service.pending_resolutions

@router.post("/decision")
def submit_resolution_decision(decision: ResolutionDecision) -> Dict[str, Any]:
    """Applies an officer's decision (MERGE or REJECT) with live atomic graph collapse."""
    return supabase_service.apply_merge_decision(
        candidate_id=decision.candidate_id,
        action=decision.action,
        officer_id=decision.officer_id,
        notes=decision.notes or ""
    )
