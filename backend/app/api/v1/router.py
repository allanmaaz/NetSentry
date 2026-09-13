from fastapi import APIRouter
from backend.app.api.v1.endpoints import graph, entities, resolution, ingestion, analytics

api_router = APIRouter()
api_router.include_router(graph.router, prefix="/graph", tags=["Graph"])
api_router.include_router(entities.router, prefix="/entities", tags=["Entities"])
api_router.include_router(resolution.router, prefix="/resolve", tags=["Resolution"])
api_router.include_router(ingestion.router, prefix="/ingest", tags=["Ingestion"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Tactical AI"])
