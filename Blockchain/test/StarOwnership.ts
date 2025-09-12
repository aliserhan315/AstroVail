import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, stringToBytes } from "viem";

describe("StarOwnership", () => {
  it("mints once per deterministic tokenId and locks transfer by default", async () => {
    const { viem } = await network.connect();
    const [admin, alice, bob] = await viem.getWalletClients();

    const star = await viem.deployContract("StarOwnership", [admin.account.address]);

    const tokenId = BigInt(keccak256(stringToBytes("Gaia DR3 123456")));
    await star.write.mintStar([alice.account.address, tokenId, "ipfs://star1.json"], { client: { wallet: admin } });

    await assert.rejects(
      star.write.mintStar([bob.account.address, tokenId, "ipfs://dup.json"], { client: { wallet: admin } }),
      /Star claimed/
    );

    await assert.rejects(
      // safeTransferFrom(address,address,uint256)
      star.write["safeTransferFrom(address,address,uint256)"](
        [alice.account.address, bob.account.address, tokenId],
        { client: { wallet: alice } }
      ),
      /Transfers disabled/
    );
  });
});

