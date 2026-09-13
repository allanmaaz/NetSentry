from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    label: str
    name: str
    type: str  # "Person", "Phone", "Vehicle", "FIR", "BankAccount"
    risk_score: int = Field(default=50, ge=0, le=100)
    risk_tier: str = "medium"  # "critical", "high", "medium", "low"
    betweenness: float = 0.0
    orbit_level: int = 2  # 0 = Sun (Kingpin), 1 = Inner (Lieutenants), 2 = Mid (Operatives), 3 = Outer
    is_cross_jurisdiction: bool = False
    state: str = "Maharashtra"
    details: Dict[str, Any] = {}
    radius: int = 12

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # "CALLED", "TRANSFERRED_FUNDS", "ASSOCIATED_WITH", "REPORTED_IN", "SAME_AS"
    weight: float = 1.0
    label: str = ""
    is_cross_jurisdiction: bool = False

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, Any]

class EntityDetail(BaseModel):
    id: str
    canonical_name: str
    aliases: List[str]
    risk_score: int
    risk_tier: str
    centrality_rank: int
    betweenness_score: float
    is_cross_jurisdiction: bool
    states: List[str]
    phones: List[str]
    vehicles: List[str]
    bank_accounts: List[str]
    firs: List[Dict[str, Any]]
    associates: List[Dict[str, Any]]
    legal_justification: str

class MatchScoreBreakdown(BaseModel):
    levenshtein_similarity: float
    phonetic_similarity: float
    token_sort_ratio: float
    base_name_score: float
    corroboration_boost: float
    total_score: float

class PendingResolution(BaseModel):
    candidate_id: str
    primary_id: str
    primary_name: str
    primary_dept: str
    secondary_id: str
    secondary_name: str
    secondary_dept: str
    confidence_score: float
    adjudication_tier: str  # "AUTO_MERGE", "HITL_REVIEW", "SEPARATE"
    breakdown: MatchScoreBreakdown
    shared_identifiers: Dict[str, List[str]]
    legal_reasoning: str

class ResolutionDecision(BaseModel):
    candidate_id: str
    action: str  # "MERGE" or "REJECT"
    officer_id: str = "OFFICER-MH-881"
    notes: Optional[str] = "Verified cross-jurisdiction identity linkage"

class IngestResponse(BaseModel):
    status: str
    source: str
    records_processed: int
    nodes_created: int
    edges_created: int
    auto_merged: int
    queued_for_hitl: int
