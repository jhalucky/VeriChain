"""
Simple, explainable heuristic scorer for RWA documents.
OCR is optional and safe.
"""

from typing import Dict, Any, Tuple, List
import re
from PIL import Image

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except Exception:
    TESSERACT_AVAILABLE = False


def extract_text_from_file(path: str) -> str:
    """
    OCR if possible, fallback to raw text read.
    Never crashes the server.
    """
    if TESSERACT_AVAILABLE:
        try:
            img = Image.open(path)
            return pytesseract.image_to_string(img)
        except Exception:
            pass

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def _score_by_presence(text: str, keywords: Dict[str, int]):
    score = 0
    found = {}
    t = text.lower()

    for k, w in keywords.items():
        hit = int(k in t)
        found[k] = hit
        score += hit * w

    return score, found


def score_asset(text: str, metadata: Dict[str, Any] = {}):
    if not text.strip():
        return 0.0, [{"reason": "no_text", "score": 0}]

    base = 10
    breakdown = []

    keywords = {
        "deed": 10,
        "title": 8,
        "invoice": 8,
        "amount": 6,
        "signature": 6,
        "owner": 6,
        "property": 8,
        "asset": 5,
        "id": 3,
        "date": 4,
        "valuation": 8,
        "price": 5,
        "tax": 4,
        "agreement": 6,
    }

    pres_score, pres_found = _score_by_presence(text, keywords)
    base += pres_score
    breakdown.append({
        "reason": "keyword_presence",
        "detail": pres_found,
        "score": pres_score
    })

    nums = re.findall(r"[\d,]+(?:\.\d+)?", text)
    num_score = min(len(nums) * 2, 20)
    base += num_score
    breakdown.append({
        "reason": "numeric_entities",
        "count": len(nums),
        "score": num_score
    })

    has_date = bool(re.search(r"\b(19|20)\d{2}\b", text))
    if has_date:
        base += 5
    breakdown.append({
        "reason": "date_presence",
        "found": has_date,
        "score": 5 if has_date else 0
    })

    if metadata.get("verified_offchain"):
        base += 20
        breakdown.append({"reason": "metadata_verified_offchain", "score": 20})

    if metadata.get("audited"):
        base += 10
        breakdown.append({"reason": "metadata_audited", "score": 10})

    final = max(0, min(100, base))
    return float(final), breakdown


def pretty_breakdown(breakdown):
    return "\n".join(
        f"{b['reason']}: +{b.get('score', 0)}" for b in breakdown
    )
