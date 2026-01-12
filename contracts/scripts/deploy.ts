import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("FractionalFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  console.log("FractionalFactory deployed at:", factory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
