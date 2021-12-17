const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");

describe("couponsTest", () => {
  it("should change URI", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const uri = "https://ipfs.io/ipfs/TTTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png";

    await coupons.setURI(uri);

    const endingURI = await coupons.uri(1);
    console.log(uri);
    console.log(endingURI);
    expect(uri).to.equal(endingURI);
  });

  it("should change wallet", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setWallet(wallet.address);

    const endingWallet = await coupons.wallet();

    expect(endingWallet).to.equal(wallet.address);
  });
  it("should byu one coupone from first collection", async () => {
    const [wallet, addr1] = await ethers.getSigners();
    const price = await BigNumber.from("30000000000000000");

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await coupons.connect(addr1).mint(1, 1, { value: ethers.utils.parseEther("0.03") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });
});
