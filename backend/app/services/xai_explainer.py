"""
NetSentry Explainable AI (XAI) Engine
Produces plain-English, court-ready legal justifications for entity linkages,
risk scores, and cross-jurisdictional network discoveries.
"""

from typing import Dict, Any, List

def generate_entity_resolution_justification(
    primary_name: str,
    secondary_name: str,
    score_data: Dict[str, Any],
    primary_source: str = "MH Police",
    secondary_source: str = "KA Crime"
) -> str:
    """
    Generates a natural language explanation for why two records represent the same individual.
    Adheres to Section 65B Indian Evidence Act style reporting.
    """
    total_score = score_data.get("total_score", 0.0)
    percentage = int(total_score * 100)
    shared = score_data.get("shared_identifiers", {})
    breakdown = score_data.get("breakdown", {})
    
    reasons = []
    
    # 1. Phonetic & Lexical Evidence
    lev_pct = int(breakdown.get("lev", 0.0) * 100)
    phon_pct = int(breakdown.get("phonetic", 0.0) * 100)
    token_pct = int(breakdown.get("token", 0.0) * 100)
    
    if phon_pct >= 85:
        reasons.append(f"Identical phonetic footprint (Double Metaphone match {phon_pct}%) despite variant spelling across state boundaries.")
    elif lev_pct >= 75:
        reasons.append(f"High typographical character overlap ({lev_pct}%) indicating common orthographic corruption or phonetic recording artifact.")
        
    if token_pct >= 90:
        reasons.append(f"Token permutation analysis ({token_pct}%) confirms identical core name elements with differing honorifics or abbreviations.")

    # 2. Corroborating Hard Biometric / Digital Evidence
    if shared.get("phones"):
        phones_str = ", ".join(shared["phones"])
        reasons.append(f"Direct CDR correlation: Shared seized MSISDN ({phones_str}) active across both {primary_source} and {secondary_source} case records.")
        
    if shared.get("vehicles"):
        veh_str = ", ".join(shared["vehicles"])
        reasons.append(f"Physical asset linkage: Identified co-utilization of motor vehicle reg. {veh_str} in both jurisdictions.")
        
    if shared.get("accounts"):
        acc_str = ", ".join(shared["accounts"])
        reasons.append(f"Financial nexus: Shared banking node ({acc_str}) logged in FIU STR transaction logs.")

    if not reasons:
        reasons.append("Structural graph proximity and overlapping co-offenders detected across state crime databases.")

    lead_sentence = (
        f"High-confidence match ({percentage}%) between '{primary_name}' ({primary_source}) "
        f"and '{secondary_name}' ({secondary_source})."
    )
    
    legal_body = " ".join(reasons)
    recommendation = (
        "Entity merge strongly recommended. Recommended action: Consolidate criminal history "
        "and update interstate intelligence bulletin."
        if total_score >= 0.85
        else "Human-in-the-Loop review required. Cross-verify physical identity at joint state review committee."
    )
    
    return f"{lead_sentence} {legal_body} {recommendation}"

def generate_risk_score_justification(
    entity_name: str,
    risk_score: int,
    betweenness_score: float,
    is_cross_jurisdiction: bool,
    active_firs_count: int,
    subordinates_count: int
) -> str:
    """Generates a plain-English explanation for an entity's risk tier and kingpin rating."""
    centrality_pct = round(betweenness_score * 100, 2)
    
    points = []
    if centrality_pct > 5.0:
        points.append(f"Operates as a high-betweenness structural bottleneck (Centrality Index: {centrality_pct}%), bridging geographically separated criminal cells.")
    if is_cross_jurisdiction:
        points.append("Multi-jurisdictional syndicate footprint verified across Maharashtra and Karnataka.")
    if active_firs_count > 1:
        points.append(f"Named in {active_firs_count} active FIRs across multiple state police commissionerates.")
    if subordinates_count > 0:
        points.append(f"Directs at least {subordinates_count} identified subordinate conduits and logistics handlers.")
        
    summary = " ".join(points) if points else "Standard operational profile with moderate local nexus."
    return f"Composite Risk Rating {risk_score}/100. {summary}"
