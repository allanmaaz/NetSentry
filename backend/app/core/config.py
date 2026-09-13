import os

class Settings:
    PROJECT_NAME: str = "NetSentry Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Security & CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "https://*.pages.dev",
        "https://*.trycloudflare.com",
        "*"
    ]
    
    # Resolution Thresholds
    AUTO_MERGE_THRESHOLD: float = 0.85
    HITL_MIN_THRESHOLD: float = 0.60

settings = Settings()
