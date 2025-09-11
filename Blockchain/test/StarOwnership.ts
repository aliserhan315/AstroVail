import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";

const { ethers } = hre;

function idFromCatalog(catalog: string) {
  const hash = keccak256(toUtf8Bytes(catalog));
  return BigInt(hash);
}

describe("StarOwnership", () => {
  it("mints once per tokenId and blocks transfers by default", async () => {
    const [admin, alice, bob] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("StarOwnership");
    const c = await Factory.deploy(await admin.getAddress());
    await c.waitForDeployment();

    const tokenId = idFromCatalog("Gaia DR3 123456789");

    await c.connect(admin).mintStar(await alice.getAddress(), tokenId, "ipfs://star123");
    await expect(
      c.connect(admin).mintStar(await bob.getAddress(), tokenId, "ipfs://dup")
    ).to.be.revertedWith("Star already claimed");
    await expect(
      c.connect(alice)["safeTransferFrom(address,address,uint256)"](
        await alice.getAddress(),
        await bob.getAddress(),
        tokenId
      )
    ).to.be.revertedWith("Transfers disabled");
    const TRANSFER_ROLE = await c.TRANSFER_ROLE();
    await c.connect(admin).grantRole(TRANSFER_ROLE, await admin.getAddress());

    await c.connect(admin)["safeTransferFrom(address,address,uint256)"](
      await alice.getAddress(),
      await bob.getAddress(),
      tokenId
    );

    expect(await c.ownerOf(tokenId)).to.equal(await bob.getAddress());
  });
});
