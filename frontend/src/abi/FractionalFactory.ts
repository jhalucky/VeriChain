import { ethers } from "ethers";
import FractionalFactoryABI from "../abi/FractionalFactory.json";

const FRACTIONAL_FACTORY_ADDRESS = "0x6e43827c837F3353209C207647682EB66EEffF4B";

export async function getFractionalFactory() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    FRACTIONAL_FACTORY_ADDRESS,
    FractionalFactoryABI,
    signer // 🔥 THIS IS CRITICAL
  );
}
