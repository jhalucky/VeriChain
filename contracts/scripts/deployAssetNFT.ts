// scripts/deployAssetNFT.ts
import { ethers } from "hardhat";

async function main() {
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy("Asset NFT", "ASSET");
  await assetNFT.waitForDeployment();

  console.log("AssetNFT deployed at:", assetNFT.target);
}

main();