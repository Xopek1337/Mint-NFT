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

  it("should bye one coupone from first collection", async () => {
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

  it("should get coupon's supplies", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const couponSupplies = await coupons.getCouponSupplies();

    const a = await coupons.supplies(0);

    expect(a).to.equal(couponSupplies[0]);
  });

  it("should get minted coupons", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const mintedCoupons = await coupons.getMintedCoupons();

    const a = await coupons.minted(0);

    expect(a).to.equal(mintedCoupons[0]);
  });

  it("should get coupon's rates", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const couponRates = await coupons.getCouponRates();

    const a = await coupons.rates(0);

    expect(a).to.equal(couponRates[0]);
  });

  it("should change coupon's price of the first collection from 0.03 ether to 0.05 ether", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const amount = ethers.utils.parseEther("0.05");
    const startingPrice = await coupons.rates(0);

    await coupons.changeCouponPrice(1, amount);

    const endingPrice = await coupons.rates(0);

    expect(amount).to.equal(endingPrice);
  });

  it("should change coupon's amount of the first collection from 100 to 150", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    const amount = 150;
    const startingAmount = await coupons.supplies(0);

    await coupons.changeCouponAmount(1, amount);

    const endingAmount = await coupons.supplies(0);

    expect(amount).to.equal(endingAmount);
  });

  it("should fail if nonSaleMode is activated", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await expect(
      coupons.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("3") }),
    ).to.be.revertedWith("Coupons::mint: Sales are closed");
  });

  it("should fail if collectionId is more than the maximum", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    await expect(
      coupons.connect(addr1).mint(11, 11, { value: ethers.utils.parseEther("0.33") }),
    ).to.be.revertedWith("Coupons::mint: Collection doesn't exist");
  });

  it("should fail if collectionId doesn't exist", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    await expect(
      coupons.connect(addr1).mint(0, 11, { value: ethers.utils.parseEther("0.33") }),
    ).to.be.revertedWith("Coupons::mint: Collection doesn't exist");
  });

  it("should fail if amount is more than enough supply of the collection", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    await expect(
      coupons.connect(addr1).mint(1, 110, { value: ethers.utils.parseEther("3.3") }),
    ).to.be.revertedWith("Coupons::mint: Not enough supply");
  });

  it("should fail if ether sent isn't enough", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    await expect(
      coupons.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("2.9") }),
    ).to.be.revertedWith("Coupons::mint: Not enough ether sent");
  });

  it("should turn on nonSaleMode", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    await coupons.setNonSaleMode();

    const sale = await coupons.sale();

    expect(false).to.equal(sale);
  });

  it("should turn on saleMode", async () => {
    const [wallet] = await ethers.getSigners();

    const couponsInstance = await ethers.getContractFactory("Coupons");
    const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
    await coupons.deployed();

    await coupons.setSaleMode();

    const sale = await coupons.sale();

    expect(true).to.equal(sale);
  });
});
