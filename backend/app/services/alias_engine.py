"""
NetSentry Indic Alias Engine — The Crown Jewel
Multi-layered phonetic, typographical, and corroborated entity resolution
tailored for Indian Law Enforcement & Multi-Script names.
"""

import re
import unicodedata
from typing import Dict, List, Tuple, Any
from rapidfuzz import fuzz, distance

# Devanagari to IAST/Roman phonetic transliteration mapping
INDIC_TRANSLITERATION_MAP = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', '्': '', '़': ''
}

INDIAN_HONORIFICS = {
    "bhai", "don", "dada", "seth", "anna", "ustad", "chacha", "baba", "chhota", "bada",
    "painter", "shooter", "mechanic", "doctor", "pandit", "khan", "patil", "shaikh"
}

INDIAN_ABBREVIATIONS = {
    "mohd": "mohammad",
    "md": "mohammad",
    "mohammed": "mohammad",
    "muhammad": "mohammad",
    "sk": "shaikh",
    "sh": "shaikh",
    "sy": "sayed",
    "adv": "advocate",
    "capt": "captain"
}

def transliterate_indic(text: str) -> str:
    """Converts Devanagari/Indic characters to standardized Roman phonetic representation."""
    if not text:
        return ""
    result = []
    for char in text:
        if char in INDIC_TRANSLITERATION_MAP:
            result.append(INDIC_TRANSLITERATION_MAP[char])
        else:
            result.append(char)
    return "".join(result)

def clean_and_normalize_name(name: str, strip_honorifics: bool = True) -> str:
    """Cleans punctuation, transliterates Devanagari, expands abbreviations, and lowercases."""
    if not name:
        return ""
    
    # 1. Transliterate if Devanagari present
    transliterated = transliterate_indic(name)
    
    # 2. Normalize unicode & remove special chars
    normalized = unicodedata.normalize('NFKD', transliterated)
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', normalized).lower()
    
    # 3. Expand Indian standard name contractions & optionally remove honorifics
    tokens = cleaned.split()
    expanded_tokens = []
    for t in tokens:
        expanded = INDIAN_ABBREVIATIONS.get(t, t)
        if strip_honorifics and expanded in INDIAN_HONORIFICS:
            continue
        expanded_tokens.append(expanded)
    
    # If stripping removed everything (e.g. name was literally just "Bhai"), keep original
    if not expanded_tokens:
        expanded_tokens = [INDIAN_ABBREVIATIONS.get(t, t) for t in tokens]
        
    return " ".join(expanded_tokens)

def compute_metaphone_code(text: str) -> str:
    """
    Lightweight robust phonetic encoder tuned for Indian phonology
    (handles 'ph'->'f', 'v'->'w', 'z'->'j', soft vowels, dental consonants).
    """
    cleaned = clean_and_normalize_name(text)
    if not cleaned:
        return ""
    
    # Consonant phonetic substitutions
    s = cleaned
    s = re.sub(r'ph', 'f', s)
    s = re.sub(r'bh', 'b', s)
    s = re.sub(r'dh', 'd', s)
    s = re.sub(r'th', 't', s)
    s = re.sub(r'gh', 'g', s)
    s = re.sub(r'kh', 'k', s)
    s = re.sub(r'sh', 's', s)
    s = re.sub(r'ch', 'c', s)
    s = re.sub(r'ee', 'i', s)
    s = re.sub(r'oo', 'u', s)
    s = re.sub(r'[aeiouy]', '', s) # Drop non-initial vowels
    
    # Deduplicate adjacent consonants
    compressed = []
    for char in s:
        if not compressed or compressed[-1] != char:
            compressed.append(char)
            
    return "".join(compressed)

def calculate_name_similarity(name1: str, name2: str) -> Tuple[float, Dict[str, float]]:
    """
    Computes weighted 3-factor composite name similarity:
    - Levenshtein / Normalized edit distance: 0.35
    - Phonetic Metaphone similarity: 0.35
    - Token Sort Ratio (word-order invariant): 0.30
    """
    norm1 = clean_and_normalize_name(name1)
    norm2 = clean_and_normalize_name(name2)
    
    if not norm1 or not norm2:
        return 0.0, {"lev": 0.0, "phonetic": 0.0, "token": 0.0}
        
    if norm1 == norm2:
        return 1.0, {"lev": 1.0, "phonetic": 1.0, "token": 1.0}

    # 1. Levenshtein ratio (0.0 to 1.0)
    lev_ratio = distance.Levenshtein.normalized_similarity(norm1, norm2)
    
    # 2. Phonetic similarity
    code1 = compute_metaphone_code(norm1)
    code2 = compute_metaphone_code(norm2)
    if code1 and code2:
        phonetic_ratio = distance.Levenshtein.normalized_similarity(code1, code2)
    else:
        phonetic_ratio = 0.5 if norm1[:1] == norm2[:1] else 0.0
        
    # 3. Token Set Ratio (handles subset names like 'Mohd Aslam' vs 'Aslam')
    token_ratio = fuzz.token_set_ratio(norm1, norm2) / 100.0

    # Composite weighted formula
    composite = (0.35 * lev_ratio) + (0.35 * phonetic_ratio) + (0.30 * token_ratio)
    
    breakdown = {
        "lev": round(lev_ratio, 4),
        "phonetic": round(phonetic_ratio, 4),
        "token": round(token_ratio, 4)
    }
    
    return round(composite, 4), breakdown

def evaluate_corroboration(
    shared_phones: List[str],
    shared_vehicles: List[str],
    shared_accounts: List[str]
) -> Tuple[float, Dict[str, List[str]]]:
    """
    Calculates corroboration boosts from hard biometric/telecom/financial keys:
    - Shared Seized Phone: +0.40
    - Shared Vehicle Reg:  +0.35
    - Shared Bank Account: +0.45
    """
    boost = 0.0
    shared = {}
    
    if shared_phones:
        boost += 0.40
        shared["phones"] = shared_phones
    if shared_vehicles:
        boost += 0.35
        shared["vehicles"] = shared_vehicles
    if shared_accounts:
        boost += 0.45
        shared["accounts"] = shared_accounts
        
    return boost, shared

def resolve_entity_pair(
    entity1: Dict[str, Any],
    entity2: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Full 3-Tier Adjudication Pipeline:
    Returns final score, tier (AUTO_MERGE, HITL_REVIEW, SEPARATE), and breakdown.
    """
    name1 = entity1.get("name", "")
    name2 = entity2.get("name", "")
    
    base_name_score, breakdown = calculate_name_similarity(name1, name2)
    
    # Check shared identifiers
    phones1 = set(entity1.get("phones", []))
    phones2 = set(entity2.get("phones", []))
    shared_phones = list(phones1.intersection(phones2))
    
    vehicles1 = set(entity1.get("vehicles", []))
    vehicles2 = set(entity2.get("vehicles", []))
    shared_vehicles = list(vehicles1.intersection(vehicles2))
    
    accounts1 = set(entity1.get("bank_accounts", []))
    accounts2 = set(entity2.get("bank_accounts", []))
    shared_accounts = list(accounts1.intersection(accounts2))
    
    boost, shared_dict = evaluate_corroboration(shared_phones, shared_vehicles, shared_accounts)
    
    total_score = min(1.0, round(base_name_score + boost, 4))
    
    if total_score >= 0.85:
        tier = "AUTO_MERGE"
    elif total_score >= 0.60:
        tier = "HITL_REVIEW"
    else:
        tier = "SEPARATE"
        
    return {
        "total_score": total_score,
        "tier": tier,
        "base_name_score": base_name_score,
        "corroboration_boost": boost,
        "breakdown": breakdown,
        "shared_identifiers": shared_dict
    }
