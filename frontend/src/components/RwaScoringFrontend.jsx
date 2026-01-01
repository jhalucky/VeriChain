import React, { useState } from "react";
import { ethers } from "ethers";
import { Upload as UploadIcon, Cpu, ArrowLeft } from "lucide-react";



const Button = ({ children, className = "", variant = "default", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    default: "bg-gradient-to-r from-neon-yellow/20 to-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow hover:bg-neon-yellow/20 hover:border-neon-yellow/50 hover:shadow-lg hover:shadow-neon-yellow/20",
    primary: "bg-gradient-to-r from-laser-blue to-electric-cyan text-white hover:opacity-90 hover:shadow-lg hover:shadow-laser-blue/30",
    secondary: "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
  };
  
  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "", neon = false }) => (
  <div className={`p-4 sm:p-5 rounded-xl bg-gradient-to-br from-dark-surface to-dark-surface/50 border ${neon ? 'border-neon-yellow/20' : 'border-white/10'} backdrop-blur-sm shadow-xl ${className}`}>
    {children}
  </div>
);

const Label = ({ children }) => <div className="text-xs sm:text-sm text-white/70 mb-2 font-medium">{children}</div>;

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
  const [clicked, setClicked] = useState(false);

  
  const backendBase = import.meta.env.VITE_BACKEND_URL || "https://malonyl-judgeable-jayda.ngrok-free.dev";
  console.log(backendBase);

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
    <Card neon className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            Upload Asset
            <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse"></div>
          </div>
          <div className="text-xs sm:text-sm text-white/60 mt-1">Image or PDF — AI-powered extraction & scoring</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm text-white/60 truncate max-w-[120px] sm:max-w-none">
            {walletAddr ? walletAddr.substring(0, 6) + "..." + walletAddr.slice(-4) : "Not connected"}
          </div>
          <Button onClick={connectWallet} variant="primary" className="whitespace-nowrap">
            Connect Wallet
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <input id="fileinput" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        <label htmlFor="fileinput" className="cursor-pointer flex-1">
          <div className="px-4 py-2.5 rounded-lg border border-neon-yellow/20 hover:border-neon-yellow/40 transition-all duration-300 bg-gradient-to-r from-neon-yellow/5 to-transparent hover:from-neon-yellow/10">
            <div className="flex items-center gap-2">
              <UploadIcon size={18} className="text-neon-yellow flex-shrink-0" />
              <div className="text-sm text-white/80 truncate">{file ? file.name : "Choose file"}</div>
            </div>
          </div>
        </label>

        <div className="flex gap-2">
          <Button onClick={uploadFile} disabled={loading || !file} variant="default" className="flex-1 sm:flex-none">
            {loading ? "Uploading..." : "Upload"}
          </Button>
          <Button onClick={requestScore} disabled={loading} variant="default" className="flex-1 sm:flex-none">
            Score
          </Button>
          <Button onClick={requestTokenizePayload} disabled={loading || !assetId} variant="default" className="flex-1 sm:flex-none">
            Tokenize
          </Button>
        </div>
      </div>

      {message && (
        <div className={`text-xs sm:text-sm p-3 rounded-lg border backdrop-blur-sm ${
          message.includes('❌') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          message.includes('⚠️') ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30' :
          message.includes('✅') ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          'bg-laser-blue/10 text-laser-blue border-laser-blue/30'
        }`}>
          {message}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
          <div className="w-4 h-4 border-2 border-neon-yellow/30 border-t-neon-yellow rounded-full animate-spin"></div>
          Processing...
        </div>
        
      )}
    </Card>
    
  );

  const ScoreCard = () => (
    <Card neon>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-white/60 mb-1">AI Score</div>
          <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-neon-yellow to-electric-cyan bg-clip-text">
            {scoreResp ? scoreResp.score : "--"}
          </div>
          <div className="text-xs text-white/50 mt-1">out of 100</div>
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm text-white/50 mb-2">Breakdown</div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-neon-yellow/30 flex items-center justify-center">
            <Cpu size={24} className="text-neon-yellow" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Label>Analysis Details</Label>
        <div className="max-h-48 overflow-y-auto custom-scrollbar">
          <pre className="text-xs bg-black/40 p-3 rounded-lg text-white/70 whitespace-pre-wrap break-words border border-white/5">
            {scoreResp ? JSON.stringify(scoreResp.breakdown, null, 2) : "No score data available yet"}
          </pre>
        </div>
      </div>

     
    </Card>
  );

  const PayloadCard = () => (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-white/60 mb-1">Tokenization</div>
          <div className="text-base sm:text-lg font-bold text-white truncate">
            {tokenPayload ? tokenPayload.constructor_args?.name || "RWA Fraction" : "No payload"}
          </div>
        </div>
        <div>
          {tokenPayload?.deployedAddress ? (
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-medium">
              Deployed
            </div>
          ) : tokenPayload ? (
            <div className="px-3 py-1 bg-neon-yellow/20 border border-neon-yellow/30 rounded-full text-xs text-neon-yellow font-medium">
              Ready
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-4">
        <Label>Contract Payload</Label>
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <pre className="text-xs bg-black/40 p-3 rounded-lg text-white/70 whitespace-pre-wrap break-words border border-white/5">
            {tokenPayload ? JSON.stringify(tokenPayload, null, 2) : "No payload prepared yet"}
          </pre>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!tokenPayload?.deployedAddress && tokenPayload && (
          <Button onClick={deployContractWithMetaMask} variant="primary" className="w-full">
            Deploy via MetaMask
          </Button>
        )}
        {tokenPayload?.deployedAddress && (
          <a 
            className="text-xs sm:text-sm text-electric-cyan hover:text-electric-cyan/80 transition-colors flex items-center gap-2 justify-center py-2" 
            href={`https://explorer.mantle.xyz/address/${tokenPayload.deployedAddress}`} 
            target="_blank" 
            rel="noreferrer"
          >
            View on Mantle Explorer →
          </a>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-space via-dark-surface to-deep-space text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {onBackToHome && (
              <Button 
                onClick={onBackToHome}
                variant="secondary"
                className="gap-2"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-white/60">RWA Scoring Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Uploader />

            <Card>
              <Label>Extracted Text</Label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={10}
                placeholder="Extracted text will appear here, or you can paste your own..."
                className="w-full p-3 sm:p-4 rounded-lg bg-black/40 border border-white/10 text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-neon-yellow/30 focus:border-neon-yellow/30 transition-all resize-none custom-scrollbar"
              />

              
              <div className="flex gap-2">
             <Button
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText || "");
                    setClicked(true);

                    // reset back to "Copy Text" after 2 seconds (optional UX polish)
                    setTimeout(() => setClicked(false), 2000);
                  }}
                  variant="default"
                  className="flex-1"
                  id="copyTextButton"
                >
                  {clicked ? "Copied" : "Copy Text"}
                </Button>

              <Button onClick={() => setExtractedText("")} variant="secondary" className="flex-1">
                Clear
              </Button>
            </div>
            </Card>

            <ScoreCard />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <PayloadCard />

            <Card>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-neon-yellow/20 to-laser-blue/20 border border-neon-yellow/30 flex items-center justify-center flex-shrink-0">
                  <Cpu size={24} className="text-neon-yellow" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-white/70">AI System</div>
                  <div className="text-sm sm:text-base text-white font-semibold">Heuristic ML Engine</div>
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-white/60 leading-relaxed">
                This MVP uses a heuristic scoring function. Replace the scorer endpoint with your production ML model for enhanced accuracy.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
