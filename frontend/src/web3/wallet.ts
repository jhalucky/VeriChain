import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}
