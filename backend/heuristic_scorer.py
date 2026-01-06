import re
from typing import Dict, Tuple

ASSET_TERMS = [
    "asset", "ownership", "valuation", "contract",
    "liability", "revenue", "token", "fraction",
    "rights", "obligation", "lease", "yield", "cashflow"
]

def _numeric_density(text: str) -> float:
    if not text:
        return 0.0
    return sum(c.isdigit() for c in text) / len(text)

def _keyword_hits(text: str) -> int:
    t = text.lower()
    return sum(1 for term in ASSET_TERMS if term in t)

def score_asset(text: str, metadata: Dict | None = None) -> Tuple[float, Dict]:
    text = text or ""
    length = len(text)

    # Feature scores (0..1)
    structure_score = min(length / 5000, 1.0)
    numeric_score = min(_numeric_density(text) * 10, 1.0)
    keyword_score = min(_keyword_hits(text) / 6, 1.0)

    # Optional metadata bonus (safe default)
    meta_bonus = 0.0
    if metadata:
        meta_bonus = min(len(metadata.keys()) / 5, 1.0) * 0.1

    score = (
        0.4 * structure_score +
        0.3 * numeric_score +
        0.3 * keyword_score
    ) + meta_bonus

    score = max(0.0, min(score, 1.0))

    breakdown = {
        "structure_score": round(structure_score, 3),
        "numeric_score": round(numeric_score, 3),
        "keyword_score": round(keyword_score, 3),
        "keyword_hits": _keyword_hits(text),
        "text_length": length,
        "metadata_bonus": round(meta_bonus, 3),
    }

    return round(score, 3), breakdown
