# ml_scorer.py
import re
import numpy as np
import joblib
from typing import Tuple, Dict, Any

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
LGB_MODEL_PATH = "models/rwa_lgbm.pkl"

_embed_model = None
_lgb_model = None


def _lazy_load_models():
    """
    Load heavy models only once, when actually needed.
    Prevents Windows paging file crash.
    """
    global _embed_model, _lgb_model

    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        print("🔄 Loading embedding model...")
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)

    if _lgb_model is None:
        print("🔄 Loading LightGBM model...")
        _lgb_model = joblib.load(LGB_MODEL_PATH)

    return _embed_model, _lgb_model


def simple_features(text: str):
    nums = re.findall(r"[\d,]+(?:\.\d+)?", text)
    has_date = bool(re.search(r"\b(19|20)\d{2}\b", text))
    has_sig = "signature" in text.lower() or "signed" in text.lower()

    return np.array(
        [[len(nums), int(has_date), int(has_sig)]],
        dtype=float
    )


def score_asset_ml(text: str, metadata: Dict[str, Any] = None) -> Tuple[float, list]:
    metadata = metadata or {}
    text = (text or "").strip()

    if not text:
        return 0.0, [{"reason": "no_text", "score": 0}]

    embed_model, lgb_model = _lazy_load_models()

    embedding = embed_model.encode(
        [text],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    proba = lgb_model.predict(embedding)
    score = float(proba[0] * 100.0)

    extra = simple_features(text)

    breakdown = [
        {"reason": "model_probability", "score": score},
        {
            "reason": "num_entities",
            "value": int(extra[0, 0]),
            "score": min(int(extra[0, 0]) * 2, 20),
        },
        {
            "reason": "has_date",
            "value": bool(extra[0, 1]),
            "score": 5 if extra[0, 1] else 0,
        },
        {
            "reason": "has_signature",
            "value": bool(extra[0, 2]),
            "score": 5 if extra[0, 2] else 0,
        },
    ]

    return score, breakdown
