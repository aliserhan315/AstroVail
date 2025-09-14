import { network } from "hardhat";
import { keccak256, stringToBytes } from "viem";

async function main() {
  const contract = process.argv[2] as `0x${string}` | undefined;
  if (!contract) {
    throw new Error("Usage: npx hardhat run scripts/mintStar.ts --network baseSepolia 0xYourContract");
  }

  const { viem } = await network.connect();
  const [admin, user] = await viem.getWalletClients();

  const star = await viem.getContractAt("StarOwnership", contract);

  const tokenId = BigInt(keccak256(stringToBytes("Gaia DR3 999999")));
  const tx = await star.write.mintStar(
    [user.account.address, tokenId, "ipfs://star.json"],
    { client: { wallet: admin } }
  );
  console.log("Mint tx:", tx);
}

main().catch((e) => { console.error(e); process.exit(1); });
