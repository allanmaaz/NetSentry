import os
from typing import Dict, Any
from fastapi import APIRouter
from backend.app.services.supabase_service import supabase_service

router = APIRouter()

@router.post("/reload")
def reload_datasets() -> Dict[str, Any]:
    """Reloads and regenerates all synthetic datasets into the graph."""
    supabase_service.load_synthetic_dataset()
    stats = supabase_service.get_solar_system_graph()["stats"]
    return {
        "status": "success",
        "message": "Synthetic crime and financial intelligence datasets reloaded successfully.",
        "stats": stats
    }
