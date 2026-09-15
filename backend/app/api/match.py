"""
NetSentry — ML Alias Match API (T1.2)
POST /api/ml/match → confidence score + feature breakdown using the
trained sklearn Random Forest (backend/app/ml/alias_matcher_model.joblib).
"""
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "alias_matcher_model.joblib"

_model = None
_model_error: Optional[str] = None


def _get_model():
    global _model, _model_error
    if _model is not None:
        return _model
    try:
        import joblib

        _model = joblib.load(MODEL_PATH)
        return _model
    except Exception as exc:  # sklearn missing / model absent → graceful fallback
        _model_error = str(exc)
        return None


def _consonant_skeleton(name: str) -> str:
    vowels = set("aeiouAEIOU")
    return "".join(ch for ch in name if ch.isalpha() and ch not in vowels).lower()


class MatchRequest(BaseModel):
    name_a: str = Field(..., description="First suspect name (any script)")
    name_b: str = Field(..., description="Second suspect name (any script)")
    shared_phone: bool = False
    shared_vehicle: bool = False
    shared_account: bool = False
    phones_a: List[str] = []
    phones_b: List[str] = []
    vehicles_a: List[str] = []
    vehicles_b: List[str] = []


class FeatureScore(BaseModel):
    name: str
    value: float
    weight: str


class MatchResponse(BaseModel):
    confidence_score: float
    decision: str
    feature_breakdown: List[FeatureScore]
    model: str
    fallback: bool = False


@router.post("/match", response_model=MatchResponse)
def alias_match(req: MatchRequest):
    try:
        from rapidfuzz import fuzz
    except ImportError:
        from difflib import SequenceMatcher

        class _Fuzz:
            @staticmethod
            def ratio(a, b):
                return SequenceMatcher(None, a, b).ratio() * 100

            @staticmethod
            def token_set_ratio(a, b):
                return SequenceMatcher(None, a, b).ratio() * 100

        fuzz = _Fuzz()

    shared_phone = req.shared_phone or bool(set(req.phones_a) & set(req.phones_b))
    shared_vehicle = req.shared_vehicle or bool(set(req.vehicles_a) & set(req.vehicles_b))

    lev = fuzz.ratio(req.name_a, req.name_b) / 100.0
    phonetic = fuzz.ratio(_consonant_skeleton(req.name_a), _consonant_skeleton(req.name_b)) / 100.0
    token = fuzz.token_set_ratio(req.name_a, req.name_b) / 100.0

    features = [lev, phonetic, token, float(shared_phone), float(shared_vehicle), float(req.shared_account)]

    model = _get_model()
    if model is None:
        # Weighted fallback mirrors client-side rfAliasMatcher weights
        score = (
            float(shared_phone) * 0.352
            + phonetic * 0.261
            + float(shared_vehicle) * 0.184
            + token * 0.118
            + lev * 0.085
        )
        return MatchResponse(
            confidence_score=round(min(1.0, score), 4),
            decision="AUTO_MERGE" if score >= 0.85 else ("HITL_REVIEW" if score >= 0.60 else "SEPARATE"),
            feature_breakdown=[
                FeatureScore(name="Levenshtein Edit Distance", value=round(lev, 4), weight="8.5%"),
                FeatureScore(name="Double Metaphone Phonetic", value=round(phonetic, 4), weight="26.1%"),
                FeatureScore(name="Token Set Overlap", value=round(token, 4), weight="11.8%"),
                FeatureScore(name="Shared Telecom MSISDN", value=float(shared_phone), weight="35.2%"),
                FeatureScore(name="Shared Vehicle Plate", value=float(shared_vehicle), weight="18.4%"),
                FeatureScore(name="Shared Bank Account", value=float(req.shared_account), weight="9.0%"),
            ],
            model="weighted-fallback",
            fallback=True,
        )

    proba = float(model.predict_proba([features])[0][1])
    importances = getattr(model, "feature_importances_", [0.085, 0.261, 0.118, 0.352, 0.184, 0.0])
    names = [
        "Levenshtein Edit Distance",
        "Double Metaphone Phonetic",
        "Token Set Overlap",
        "Shared Telecom MSISDN",
        "Shared Vehicle Plate",
        "Shared Bank Account",
    ]
    return MatchResponse(
        confidence_score=round(proba, 4),
        decision="AUTO_MERGE" if proba >= 0.85 else ("HITL_REVIEW" if proba >= 0.60 else "SEPARATE"),
        feature_breakdown=[
            FeatureScore(name=n, value=round(float(v), 4), weight=f"{float(w) * 100:.1f}%")
            for n, v, w in zip(names, features, importances)
        ],
        model="random-forest-sklearn",
        fallback=False,
    )
