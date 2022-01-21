const { expect } = require("chai");
const { ethers } = require("hardhat");

const URI = "https://gateway.pinata.cloud/ipfs/QmPhNgR9i4PFtwhaXtf88iNTaq6Lnxs2Y6XxyH27AZmkYE";

describe("ERC1155MintTest", () => {
    let erc1155;

  beforeEach(async () => {
    [addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    erc1155 = await erc1155Instance.deploy("MineichToken","MNC", URI);
  });

  it("should mint", async () => {
    await erc1155.setManager(addr1.address);

    const collectionId = 1;
    const amount = 5;

    await erc1155.connect(addr1).mint(collectionId, amount, addr1.address);

    const mintedCoupons = await erc1155.balanceOf(addr1.address, collectionId);

    expect(amount).to.equal(mintedCoupons);
  });

  it("should set manager", async () => {
    await erc1155.setManager(addr1.address);

    const manager = await erc1155.manager();

    expect(manager).to.equal(addr1.address);
  });

  it("should fail if minter is not manager", async () => {
    const collectionId = 1;
    const amount = 5;

    await expect(
      erc1155.connect(addr1).mint(collectionId, amount, addr1.address),
    ).to.be.revertedWith("ERC1155Mint::mint: sender is not manager");
  });

  it("should return IPFS URL", async () => {
    const answer = await erc1155.uri(0);

    expect(URI + "/0").to.equal(answer);
  });
});
