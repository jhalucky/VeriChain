import { getFractionalFactory } from "../abi/FractionalFactory";

export async function fractionalizeAsset(
  assetNFTAddress: string,
  tokenId: number
) {
  const factory = await getFractionalFactory();

  const tx = await factory.createFraction(
    "RWA Fraction",
    "RWAF",
    1_000_000n,
    assetNFTAddress,
    tokenId
  );

  const receipt = await tx.wait();

  const event = receipt.logs.find(
    (log: any) => log.fragment?.name === "FractionCreated"
  );

  if (!event) throw new Error("FractionCreated event not found");

  return event.args.tokenAddress;
}
