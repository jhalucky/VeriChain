from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import uuid
from typing import Optional, Dict, Any

from scorer import extract_text_from_file, pretty_breakdown
from ml_scrorer import score_asset_ml


STORAGE_DIR = Path("uploads")
STORAGE_DIR.mkdir(exist_ok=True)

app = FastAPI(title="RWA Scoring Engine (MVP)")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class ScoreRequest(BaseModel):
    asset_id: Optional[str] = None
    raw_text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TokenizeRequest(BaseModel):
    asset_id: str
    token_name: str
    token_symbol: str
    total_supply: int
    fraction_count: int


@app.get("/")
async def root():
    return {
        "message": "RWA Scoring Engine API",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "upload": "/upload",
            "score": "/score",
            "tokenize": "/tokenize"
        }
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())
    filepath = STORAGE_DIR / f"{uid}_{file.filename}"

    with open(filepath, "wb") as f:
        f.write(await file.read())

    try:
        extracted_text = extract_text_from_file(str(filepath))
    except Exception:
        extracted_text = ""

    return {
        "asset_id": uid,
        "filename": str(filepath),
        "extracted_text": extracted_text[:1000]
    }

@app.post("/score")
async def score(req: ScoreRequest):
    if req.asset_id:
        matches = list(STORAGE_DIR.glob(f"{req.asset_id}_*"))
        if not matches:
            raise HTTPException(status_code=404, detail="asset_id not found")
        text = extract_text_from_file(str(matches[0]))

    elif req.raw_text:
        text = req.raw_text

    else:
        raise HTTPException(
            status_code=400,
            detail="Provide asset_id or raw_text"
        )

    score_value, breakdown = score_asset_ml(
        text=text,
        metadata=req.metadata or {}
    )

    return {
        "score": round(score_value, 3),
        "breakdown": breakdown,
        "pretty": pretty_breakdown(breakdown)
    }

@app.post("/tokenize")
async def tokenize(req: TokenizeRequest):
    return {
        "status": "ready",
        "contract_abi": [
            {
                "type": "function",
                "name": "mintAsset",
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "tokenId", "type": "uint256"}
                ]
            }
        ],
        "contract_bytecode": "0x6000...DEADBEEF",
        "constructor_args": {
            "name": req.token_name,
            "symbol": req.token_symbol,
            "total_supply": req.total_supply,
            "fraction_count": req.fraction_count,
            "asset_id": req.asset_id
        }
    }
