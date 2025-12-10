from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import uuid
from typing import Optional, Dict, Any

from scorer import extract_text_from_file, pretty_breakdown
from ml_scrorer import score_asset_ml

allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]

STORAGE_DIR = Path("uploads")
STORAGE_DIR.mkdir(exist_ok=True)

app = FastAPI(title="RWA Scoring Engine (MVP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev; you can lock it later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add root endpoint for ngrok
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

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # save file
    uid = str(uuid.uuid4())
    filename = STORAGE_DIR / f"{uid}_{file.filename}"
    with open(filename, "wb") as f:
        content = await file.read()
        f.write(content)

    # extract text (OCR stub)
    try:
        extracted_text = extract_text_from_file(str(filename))
    except Exception as e:
        extracted_text = ""  # safe fallback

    return {"asset_id": uid, "filename": str(filename), "extracted_text": extracted_text[:1000]}

@app.post("/score")
async def score(req: ScoreRequest):
    text = ""
    if req.asset_id:
        # find file by prefix
        matches = list(STORAGE_DIR.glob(f"{req.asset_id}_*"))
        if not matches:
            raise HTTPException(status_code=404, detail="asset_id not found")
        text = extract_text_from_file(str(matches[0]))
    elif req.raw_text:
        text = req.raw_text
    else:
        raise HTTPException(status_code=400, detail="Provide asset_id or raw_text")

    # metadata can help scoring
    score_value, breakdown = score_asset_ml(text, metadata=req.metadata or {})
    return {"score": round(score_value, 3), "breakdown": breakdown, "pretty": pretty_breakdown(breakdown)}

@app.post("/tokenize")
async def tokenize(req: TokenizeRequest):
    # Minimal payload: return ABI/bytecode placeholders and constructor args
    # In real flow, server might deploy or return data for client to sign & deploy.
    abi_placeholder = [{"type":"function","name":"mintAsset","inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}]}]
    bytecode_placeholder = "0x6000...DEADBEEF"

    constructor_args = {
        "name": req.token_name,
        "symbol": req.token_symbol,
        "total_supply": req.total_supply,
        "fraction_count": req.fraction_count,
        "asset_id": req.asset_id
    }

    return {
        "status": "ready",
        "contract_abi": abi_placeholder,
        "contract_bytecode": bytecode_placeholder,
        "constructor_args": constructor_args,
        "instructions": "Use returned ABI+bytecode to deploy via ethers.js/metamask. Or request server-side deployment if you have a node/key."
    }
