import { ethers } from "hardhat";

const ASSET_NFT_ADDRESS = "0xea49A502F42f6AC2C3f96C39ABcf16E20D45A3eD";

async function main() {
  const [deployer] = await ethers.getSigners();

  const assetNFT = await ethers.getContractAt(
    "AssetNFT",
    ASSET_NFT_ADDRESS
  );

  const tx = await assetNFT.mintAsset(
    deployer.address,
    "ipfs://QmYourMetadataHashHere"
  );

  const receipt = await tx.wait();

  console.log("Asset NFT minted");
  console.log("TX:", receipt?.hash);
}

main();
