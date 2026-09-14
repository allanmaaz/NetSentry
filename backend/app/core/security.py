import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any
from backend.app.models.auth import OfficerProfile, OfficerRole

# Sovereign secret key for HMAC-SHA256 (in production read from secure env)
JWT_SECRET = "netsentry-mha-sih2026-sovereign-key-358b"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400  # 24 hours

# Pre-configured sovereign LEA officer personas
OFFICER_DATABASE: Dict[str, Dict[str, Any]] = {
    "MH-POL-8821": {
        "pin": "1234",
        "profile": OfficerProfile(
            badge_id="MH-POL-8821",
            name="Rajesh Patil",
            rank="Inspector / SHO",
            station="Bund Garden PS, Pune",
            state="Maharashtra",
            role=OfficerRole.STATION_ADMIN,
            permissions=["read:graph", "read:dossier", "write:hitl_resolve", "write:simulate_arrest", "write:ingest_fir"]
        )
    },
    "KA-CID-4109": {
        "pin": "1234",
        "profile": OfficerProfile(
            badge_id="KA-CID-4109",
            name="Ananya Hegde",
            rank="Sub-Inspector / Field IO",
            station="Cubbon Park PS, Bengaluru",
            state="Karnataka",
            role=OfficerRole.FIELD_INVESTIGATOR,
            permissions=["read:graph", "read:dossier", "read:search"]
        )
    },
    "NCRB-DIR-0001": {
        "pin": "1234",
        "profile": OfficerProfile(
            badge_id="NCRB-DIR-0001",
            name="Dr. Vikramaditya Sharma, IPS",
            rank="Special Task Force Director",
            station="NCRB HQ, New Delhi",
            state="National Grid",
            role=OfficerRole.SUPER_ADMIN,
            permissions=["*"]
        )
    }
}

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += '=' * padding
    return base64.urlsafe_b64decode(data.encode('utf-8'))

def create_access_token(officer: OfficerProfile) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": officer.badge_id,
        "name": officer.name,
        "role": officer.role.value,
        "station": officer.station,
        "permissions": officer.permissions,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    
    header_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signature_input, hashlib.sha256).digest()
        
        if not hmac.compare_digest(_b64_encode(expected_sig), sig_b64):
            return None
            
        payload = json.loads(_b64_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None
