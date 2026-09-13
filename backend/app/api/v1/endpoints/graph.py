from fastapi import APIRouter
from backend.app.services.supabase_service import supabase_service
from backend.app.models.schemas import GraphResponse

router = APIRouter()

@router.get("", response_model=GraphResponse)
def get_graph():
    """Returns the solar-system graph data with nodes, edges, centralities, and orbits."""
    return supabase_service.get_solar_system_graph()
