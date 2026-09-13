import os
from typing import Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, UploadFile, File
from backend.app.services.supabase_service import supabase_service

router = APIRouter()

class CsvTextRequest(BaseModel):
    csv_text: str

@router.post("/reload")
def reload_datasets() -> Dict[str, Any]:
    """Reloads the persistent database records into the active graph."""
    supabase_service.load_dataset()
    stats = supabase_service.get_solar_system_graph()["stats"]
    return {
        "status": "success",
        "message": "Investigation database synchronized and re-indexed successfully.",
        "stats": stats
    }

@router.post("/upload-csv")
def upload_csv(req: CsvTextRequest) -> Dict[str, Any]:
    """Ingests raw CSV text, inserts records into SQLite database, and updates graph."""
    if not req.csv_text or not req.csv_text.strip():
        raise HTTPException(status_code=400, detail="CSV text cannot be empty.")
    return supabase_service.ingest_csv_data(req.csv_text)

@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Uploads a physical CSV file and ingests all law enforcement records."""
    contents = await file.read()
    try:
        csv_text = contents.decode("utf-8")
    except Exception:
        csv_text = contents.decode("latin-1")
    return supabase_service.ingest_csv_data(csv_text)
