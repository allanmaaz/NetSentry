from typing import Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter
from backend.app.services.supabase_service import supabase_service
from backend.app.models.schemas import GraphResponse

router = APIRouter()

class CypherQueryRequest(BaseModel):
    query: str

@router.get("", response_model=GraphResponse)
def get_graph():
    """Returns the solar-system graph data with nodes, edges, centralities, and orbits."""
    return supabase_service.get_solar_system_graph()

@router.get("/db-status")
def get_database_status() -> Dict[str, Any]:
    """Returns real-time status of the Neo4j Bolt driver, graph nodes/edges, and caching layer."""
    return supabase_service.get_engine_status()

@router.post("/cypher")
def execute_cypher_query(req: CypherQueryRequest) -> Dict[str, Any]:
    """Executes a Cypher query against Neo4j or the high-speed in-memory graph engine."""
    return supabase_service.execute_cypher(req.query)
