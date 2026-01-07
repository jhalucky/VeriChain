import { ContractFactory } from "ethers";
import AssetNFT_ABI from "./abi/AssetNFT.json";
import AssetNFT_BYTECODE from "./bytecode/AssetNFT";

export async function deployAssetNFT(
  signer: any,
  name: string,
  symbol: string
) {
  const factory = new ContractFactory(
    AssetNFT_ABI,
    AssetNFT_BYTECODE,
    signer
  );

  const contract = await factory.deploy(name, symbol);
  await contract.waitForDeployment();

  return contract.target; // contract address
}
