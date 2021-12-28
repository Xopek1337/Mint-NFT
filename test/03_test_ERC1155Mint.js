const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");

const URI = "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png";

describe("ERC1155MintTest", () => {
  it("should mint", async () => {
    const [addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    await erc1155.setManager(addr1.address);

    const collectionId = 1;
    const amount = 5;

    await erc1155.connect(addr1).mint(collectionId, amount, addr1.address);

    const mintedCoupons = await erc1155.balanceOf(addr1.address, collectionId);

    expect(amount).to.equal(mintedCoupons);
  });
  it("should set manager", async () => {
    const [addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    await erc1155.setManager(addr1.address);

    const manager = await erc1155.manager();

    expect(manager).to.equal(addr1.address);
  });

  it("should fail if minter is not manager", async () => {
    const [addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const collectionId = 1;
    const amount = 5;

    await expect(
      erc1155.connect(addr1).mint(collectionId, amount, addr1.address),
    ).to.be.revertedWith("ERC1155Mint::mint: sender is not manager");
  });
});
