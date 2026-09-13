from fastapi import APIRouter, HTTPException
from backend.app.services.supabase_service import supabase_service
from backend.app.models.schemas import EntityDetail

router = APIRouter()

@router.get("/{entity_id}", response_model=EntityDetail)
def get_entity_detail(entity_id: str):
    """Retrieves deep dossier and XAI justification for an entity."""
    detail = supabase_service.get_entity_detail(entity_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found")
    return detail
