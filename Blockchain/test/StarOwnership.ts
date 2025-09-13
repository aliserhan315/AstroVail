import hre from "hardhat";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { keccak256, stringToBytes } from "viem";

describe("StarOwnership", () => {
  it("mints once per deterministic tokenId and locks transfer by default", async () => {
    const [admin, alice, bob] = await hre.viem.getWalletClients();

    const star = await hre.viem.deployContract("StarOwnership", [admin.account.address]);

    const tokenId = BigInt(keccak256(stringToBytes("Gaia DR3 123456")));
    await star.write.mintStar([alice.account.address, tokenId, "ipfs://star1.json"], {
      client: { wallet: admin }
    });

    await assert.rejects(
      star.write.mintStar([bob.account.address, tokenId, "ipfs://dup.json"], {
        client: { wallet: admin }
      })
    );

    await assert.rejects(
      star.write["safeTransferFrom(address,address,uint256)"](
        [alice.account.address, bob.account.address, tokenId],
        { client: { wallet: alice } }
      )
    );
  });
});
