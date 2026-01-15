import React, { useState } from "react";
import { ethers } from "ethers";
import AssetNFT_ABI from "../abi/AssetNFT.json";
import FractionalFactory_ABI from "../abi/FractionalFactory.json";

/* ---------- CONTRACT ADDRESSES (SEPOLIA) ---------- */

const ASSET_NFT_ADDRESS = "0x4533CF1625e6764055877E84D02d70a70CE52337";
const FRACTION_FACTORY_ADDRESS = "0x6e43827c837F3353209C207647682EB66EEffF4B";

/* ---------- UI HELPERS (UNCHANGED) ---------- */

const Button = ({ children, className = "", variant = "default", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    default:
      "bg-gradient-to-r from-neon-yellow/20 to-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow",
    primary:
      "bg-gradient-to-r from-laser-blue to-electric-cyan text-white",
    secondary:
      "bg-white/5 border border-white/10 text-white/80",
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children }) => (
  <div className="p-4 rounded-xl bg-black/40 border border-white/10">
    {children}
  </div>
);

const Label = ({ children }) => (
  <div className="text-xs text-white/70 mb-2 font-medium">{children}</div>
);

/* ---------- MAIN COMPONENT ---------- */

export default function RwaScoringFrontend() {
  const [file, setFile] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [scoreResp, setScoreResp] = useState(null);
  const [fractionTokenAddress, setFractionTokenAddress] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [walletAddr, setWalletAddr] = useState(null);

  const backendBase =
    import.meta.env.VITE_BACKEND_URL || "https://verichain-xlrz.onrender.com";

  /* ---------- UPLOAD ---------- */

  const uploadFile = async () => {
    if (!file) return setMessage("⚠️ Choose a file first");

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${backendBase}/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      setAssetId(data.asset_id);
      setExtractedText(data.extracted_text || "");
      setMessage("✅ File uploaded");
    } catch (e) {
      setMessage(" Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- SCORING ---------- */

  const requestScore = async () => {
    if (!assetId && !extractedText)
      return setMessage("⚠️ Upload or paste text");

    setLoading(true);
    try {
      const res = await fetch(`${backendBase}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetId ? { asset_id: assetId } : { raw_text: extractedText }),
      });

      const data = await res.json();
      setScoreResp(data);
      setMessage(`✅ Score: ${data.score}/100`);
    } catch {
      setMessage("❌ Scoring failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- WALLET ---------- */

  const connectWallet = async () => {
    if (!window.ethereum) return setMessage("❌ MetaMask not found");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWalletAddr(accounts[0]);
    setMessage("✅ Wallet connected");
  };

  /* ---------- REAL TOKENIZATION (FIXED PROPERLY) ---------- */

const handleTokenize = async () => {
  if (!assetId) {
    setMessage("⚠️ Upload asset first");
    return;
  }

  if (!window.ethereum) {
    setMessage("❌ MetaMask not found");
    return;
  }

  try {
    setLoading(true);
    setMessage("⛓️ Tokenizing asset on-chain...");

    // 1. MetaMask provider + signer (ethers v6)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 2. Contract instance
    const factory = new ethers.Contract(
      FRACTION_FACTORY_ADDRESS,
      FractionalFactory_ABI,
      signer
    );

    // 3. Known deployed NFT + tokenId
    const ASSET_NFT_ADDRESS = "0xea49A502F42f6AC2C3f96C39ABcf16E20D45A3eD";
    const TOKEN_ID = 1;

    // 4. Send transaction
    const tx = await factory.createFraction(
      "RWA Fraction",
      "RWAF",
      1_000_000n,
      ASSET_NFT_ADDRESS,
      TOKEN_ID
    );

    setMessage("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    // 5. Parse event properly (ethers v6)
    let tokenAddress = null;

    for (const log of receipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log);
        if (parsed?.name === "FractionCreated") {
          tokenAddress = parsed.args.tokenAddress;
          break;
        }
      } catch (_) {}
    }

    if (!tokenAddress) {
      throw new Error("FractionCreated event not found");
    }

    setFractionTokenAddress(tokenAddress);
    setMessage(`✅ Asset tokenized successfully`);
  } catch (err) {
    console.error(err);
    setMessage("❌ Tokenization failed. Check console.");
  } finally {
    setLoading(false);
  }
};


  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto grid gap-6">

        <Card>
          <Label>Upload Asset</Label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} disabled={isUploading} />
          <div className="flex gap-2 mt-3">
            <Button onClick={uploadFile} disabled={isUploading}>
              {isUploading ? "⏳ Uploading..." : "Upload"}
            </Button>
            <Button onClick={requestScore}>Score</Button>
            <Button onClick={connectWallet} variant="primary">
              Connect Wallet
            </Button>
          </div>
          {isUploading && <div className="mt-2 text-sm text-neon-yellow">File is uploading...</div>}
          {message && <div className="mt-2 text-sm">{message}</div>}
        </Card>

        <Card>
          <Label>Extracted Text</Label>
          <textarea
            rows={6}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full bg-black border border-white/20 p-2"
          />
        </Card>

        {scoreResp && (
          <Card>
            <div className="text-3xl font-bold">{scoreResp.score}</div>
            <pre className="text-xs mt-2">
              {JSON.stringify(scoreResp.breakdown, null, 2)}
            </pre>
          </Card>
        )}

        <Card>
          {fractionTokenAddress ? (
            <a
              href={`https://sepolia.etherscan.io/address/${fractionTokenAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400"
            >
              View Fraction Token →
            </a>
          ) : (
            <Button onClick={handleTokenize} disabled={loading}>
              Tokenize via MetaMask
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
