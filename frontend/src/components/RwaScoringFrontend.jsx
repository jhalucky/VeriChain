import React, { useState } from "react";
import { ethers } from "ethers";
import { Upload as UploadIcon, Cpu, ArrowLeft } from "lucide-react";


const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={
      "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition " +
      "shadow-sm bg-gradient-to-br from-black/40 via-transparent to-black/20 " +
      "ring-1 ring-white/5 hover:ring-yellow-400/40 " +
      className
    }
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={"p-4 rounded-2xl bg-[#071019] border border-white/5 " + className}>
    {children}
  </div>
);

const Label = ({ children }) => <div className="text-sm text-white/70 mb-2">{children}</div>;

export default function RwaScoringFrontend({ onBackToHome }) {
  const [file, setFile] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [scoreResp, setScoreResp] = useState(null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState("");
  const [walletAddr, setWalletAddr] = useState(null);

  // Use environment variable or fallback to localhost
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const handleFileChange = (e) => setFile(e.target.files?.[0] || null);

  const uploadFile = async () => {
    if (!file) {
      setMessage("⚠️ Please choose a file first");
      return;
    }
    setLoading(true);
    setMessage("📤 Uploading file...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${backendBase}/upload`, { method: "POST", body: fd });
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setAssetId(data.asset_id);
      setExtractedText(data.extracted_text || "");
      setMessage(`✅ Uploaded successfully — ID: ${data.asset_id}`);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`❌ Upload failed: ${err.message}. Is the backend server running at ${backendBase}?`);
    } finally {
      setLoading(false);
    }
  };

  const requestScore = async () => {
    if (!assetId && !extractedText) {
      setMessage("⚠️ Please upload a file or enter text first");
      return;
    }
    setLoading(true);
    setMessage("🤖 Analyzing and scoring asset...");
    try {
      const body = assetId ? { asset_id: assetId } : { raw_text: extractedText };
      const res = await fetch(`${backendBase}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setScoreResp(data);
      setMessage(`✅ Score calculated: ${data.score}/100`);
    } catch (err) {
      console.error("Scoring error:", err);
      setMessage(`❌ Scoring failed: ${err.message}. Is the backend server running?`);
    } finally {
      setLoading(false);
    }
  };

  const requestTokenizePayload = async () => {
    if (!assetId) {
      setMessage("⚠️ Please upload a file first");
      return;
    }
    setLoading(true);
    setMessage("🔧 Preparing tokenization payload...");
    try {
      const body = {
        asset_id: assetId,
        token_name: "RWA Fraction",
        token_symbol: "RWA",
        total_supply: 1000000,
        fraction_count: 1000,
      };
      const res = await fetch(`${backendBase}/tokenize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setTokenPayload(data);
      setMessage("✅ Tokenization payload ready for deployment");
    } catch (err) {
      console.error("Tokenize error:", err);
      setMessage(`❌ Tokenization failed: ${err.message}. Is the backend server running?`);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage("❌ MetaMask not found. Please install MetaMask extension.");
      return;
    }
    try {
      setMessage("🔗 Connecting to MetaMask...");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddr(accounts[0]);
      setMessage("✅ Wallet connected successfully");
    } catch (err) {
      console.error("Wallet connection error:", err);
      setMessage(`❌ Wallet connection failed: ${err.message}`);
    }
  };

  // ethers v6 deploy flow (uses BrowserProvider)
  const deployContractWithMetaMask = async () => {
    if (!tokenPayload) return alert("Get payload");
    if (!window.ethereum) return alert("MetaMask not found");

    setDeploying(true);
    setMessage("Deploying contract...");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const abi = tokenPayload.contract_abi || [];
      const bytecode = tokenPayload.contract_bytecode || "0x";
      const ctor = tokenPayload.constructor_args || {};

      if (!bytecode || bytecode === "0x" || bytecode.length < 20) {
        alert("Backend returned placeholder bytecode — deploy via Remix/Hardhat or request server deployment.");
        setDeploying(false);
        return;
      }

      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      const args = [ctor.name || "RWA", ctor.symbol || "RWA", ctor.total_supply || 1000000];
      const contract = await factory.deploy(...args);

      setMessage("Transaction sent — waiting for deployment...");
      await contract.waitForDeployment();
      // ethers v6: contract.target is the address
      const address = contract.target || null;

      if (address) {
        setTokenPayload((p) => ({ ...p, deployedAddress: address }));
        setMessage(`Deployed at ${address}`);
      } else {
        setMessage("Deployed but address not found in response.");
      }
    } catch (err) {
      console.error(err);
      alert("Deploy failed: " + (err && err.message ? err.message : err));
    } finally {
      setDeploying(false);
    }
  };

  /* Subcomponents */
  const Uploader = () => (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-white">Upload Asset</div>
          <div className="text-sm text-white/60">Image or PDF — we'll extract and score</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/60">
            {walletAddr ? walletAddr.substring(0, 6) + "..." + walletAddr.slice(-4) : "Wallet not connected"}
          </div>
          <Button onClick={connectWallet} className="bg-gradient-to-r from-[#111214] to-[#0b0d10]">
            Connect
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <input id="fileinput" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        <label htmlFor="fileinput" className="cursor-pointer">
          <div
            className="px-4 py-2 rounded-md border border-white/5 hover:border-yellow-400/40 transition-colors"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)" }}
          >
            <div className="flex items-center gap-2">
              <UploadIcon size={18} className="text-white/80" />
              <div className="text-sm text-white/80">{file ? file.name : "Choose file"}</div>
            </div>
          </div>
        </label>

        <Button onClick={uploadFile} disabled={loading || !file} className="ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Uploading..." : "Upload"}
        </Button>
        <Button onClick={requestScore} disabled={loading}>
          {loading ? "Scoring..." : "Score"}
        </Button>
        <Button onClick={requestTokenizePayload} disabled={loading || !assetId}>
          Prepare Tokenize
        </Button>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          message.includes('⚠️') ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
          message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {message}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          Processing...
        </div>
      )}
    </Card>
  );

  const ScoreCard = () => (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-white/60">RWA Score</div>
          <div className="text-4xl font-extrabold text-white mt-1">{scoreResp ? scoreResp.score : "--"}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/50">Breakdown</div>
        </div>
      </div>

      <div className="text-sm text-white/70 mb-3">
        <pre className="text-xs bg-black/20 p-3 rounded">{scoreResp ? JSON.stringify(scoreResp.breakdown, null, 2) : "No score yet"}</pre>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigator.clipboard.writeText(extractedText || "")}>Copy Text</Button>
        <Button onClick={() => setExtractedText("")}>Clear</Button>
      </div>
    </Card>
  );

  const PayloadCard = () => (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-white/60">Tokenization</div>
          <div className="text-lg font-semibold text-white mt-1">{tokenPayload ? tokenPayload.constructor_args?.name || "RWA Fraction" : "No payload"}</div>
        </div>
        <div>{tokenPayload?.deployedAddress ? <div className="text-sm text-green-400">Deployed</div> : <div className="text-sm text-yellow-300">Ready</div>}</div>
      </div>

      <div className="mb-3">
        <pre className="text-xs bg-black/20 p-3 rounded">{tokenPayload ? JSON.stringify(tokenPayload, null, 2) : "No payload prepared"}</pre>
      </div>

      <div className="flex gap-2">
        {!tokenPayload?.deployedAddress && (
          <Button onClick={deployContractWithMetaMask} className="bg-yellow-400 text-black">
            Deploy via MetaMask
          </Button>
        )}
        {tokenPayload?.deployedAddress && (
          <a className="text-sm text-white/70" href={`https://explorer.mantle.xyz/address/${tokenPayload.deployedAddress}`} target="_blank" rel="noreferrer">
            View on Mantle Explorer
          </a>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#02040a] to-[#08121a] text-white">
      {onBackToHome && (
        <div className="max-w-6xl mx-auto mb-6">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition shadow-sm bg-gradient-to-br from-black/40 via-transparent to-black/20 ring-1 ring-white/5 hover:ring-yellow-400/40 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      )}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Uploader />

          <Card>
            <Label>Extracted Text</Label>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-md bg-[#06121b] border border-white/5 text-white/90"
            />
          </Card>

          <ScoreCard />
        </div>

        <div className="space-y-6">
          <PayloadCard />

          <Card>
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(180deg,#0b0f12,#071019)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cpu size={22} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-white/70">System</div>
                <div className="text-sm text-white">Heuristic ML stub</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-white/60">This MVP uses a heuristic scoring function. Replace scorer endpoint with your ML model for production.</div>
          </Card>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-8 text-center text-sm text-white/50">Built for Mantle Hackathon — dark UI with neon yellow accents</footer>
    </div>
  );
}
