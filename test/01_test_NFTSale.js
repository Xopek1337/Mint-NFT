const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");

const URI = "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png";

describe("NFTSaleTest", () => {
  beforeEach(async function () {
    [wallet, wallet2, addr1, addr2] = await ethers.getSigners();
  });
  it("should fail if nonSaleMode is activated", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await expect(
      NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.03") }),
    ).to.be.revertedWith("NFTSale::buyToken: sales are closed");
  });

  it("should fail if not enough supply with PreSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale._setTokenData(0, 5, ethers.utils.parseEther("0.01"));

    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") }),
    ).to.be.revertedWith("NFTSale::buyToken: not enough supply");
  });

  it("should fail if not enough supply with SaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setSaleMode();

    await NFTSale._setTokenData(0, 5, ethers.utils.parseEther("0.01"));

    await expect(
      NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") }),
    ).to.be.revertedWith("NFTSale::buyToken: not enough supply");
  });

  it("should bye one coupon from first collection with PreSaleMode", async () => {
    const price = await BigNumber.from("20000000000000000");

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await erc1155.setManager(NFTSale.address);

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 8);

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.02") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it("should bye one coupon from first collection with SaleMode", async () => {
    const price = await BigNumber.from("20000000000000000");

    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await erc1155.setManager(NFTSale.address);

    await NFTSale.setSaleMode();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.02") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it("should fail if amount is more than allowed", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.09") }),
    ).to.be.revertedWith("NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
  });

  it("should fail if you are not logged into whitelist", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await expect(
      NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.09") }),
    ).to.be.revertedWith("NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
  });

  it("should fail is amount is more than maxBuyAmount with PreSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 15);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 12, { value: ethers.utils.parseEther("0.12") }),
    ).to.be.revertedWith("NFTSale::buyToken: amount can not exceed maxBuyAmount");
  });

  it("should fail is amount is more than maxBuyAmount with SaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setSaleMode();

    await expect(
      NFTSale.connect(addr1).buyToken(0, 12, { value: ethers.utils.parseEther("0.12") }),
    ).to.be.revertedWith("NFTSale::buyToken: amount can not exceed maxBuyAmount");
  });

  it("should fail if collection does not exist wiht PreSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(2, 5, { value: ethers.utils.parseEther("0.05") }),
    ).to.be.revertedWith("NFTSale::buyToken: collection does not exist");
  });

  it("should fail if collection does not exist with SaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setSaleMode();

    await expect(
      NFTSale.connect(addr1).buyToken(2, 5, { value: ethers.utils.parseEther("0.05") }),
    ).to.be.revertedWith("NFTSale::buyToken: collection does not exist");
  });

  it("should fail if not enough ether sent with PreSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.01") }),
    ).to.be.revertedWith("NFTSale::buyToken: not enough ether sent");
  });

  it("should fail if not enough ether sent with SaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setSaleMode();

    await expect(
      NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.01") }),
    ).to.be.revertedWith("NFTSale::buyToken: not enough ether sent");
  });

  it("should turn on preSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    const preSale = await NFTSale.preSale();

    expect(true).to.equal(preSale);
  });

  it("should turn on saleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setSaleMode();

    const sale = await NFTSale.sale();

    expect(true).to.equal(sale);
  });

  it("should turn on noneSaleMode", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setNonSaleMode();

    const preSale = await NFTSale.preSale();
    const sale = await NFTSale.sale();

    expect(false).to.equal(preSale);
    expect(false).to.equal(sale);
  });

  it("should add to whitelist", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const amount = 10;

    await NFTSale.whitelistAdd(addr1.address, amount);

    const account = await NFTSale.Accounts(addr1.address);

    expect(amount).to.equal(account.allowedAmount);
  });

  it("should change maxBuyAmount", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const amount = 15;

    await NFTSale.setMaxBuyAmount(amount);

    const endingAmount = await NFTSale.maxBuyAmount();

    expect(amount).to.equal(endingAmount);
  });

  it("should change wallet", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setWallet(wallet2.address);

    const endingWallet = await NFTSale.wallet();

    expect(endingWallet).to.equal(wallet2.address);
  });

  it("should change tokenData", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const couponId = 0;
    const amount = 320;
    const rate = ethers.utils.parseEther("0.1");

    await NFTSale._setTokenData(couponId, amount, rate);

    const couponStruct = await NFTSale.tokens(couponId);
    const finishAmount = couponStruct.amount;

    expect(BigNumber.from(amount)).to.equal(finishAmount);
  });

  it("should faile if amounts length must not be equal rates length", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const amounts = [320, 300, 280, 260];
    const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3")];

    await expect(
      NFTSale.connect(wallet)._addTokens(amounts, rates),
    ).to.be.revertedWith("NFTSale::addTokens: amounts length must be equal rates length");
  });

  it("should add tokens", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const amounts = [320, 300, 280, 100];
    const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3"), ethers.utils.parseEther("0.05")];

    await NFTSale._addTokens(amounts,rates);

    const newFirstCoupon = await NFTSale.tokens(1);
    const newFirstAmount = newFirstCoupon.amount;
    const newFirstRate = newFirstCoupon.rate;

    expect(newFirstAmount).to.equal(amounts[0]);
    expect(newFirstRate).to.equal(rates[0]);
  });

  it("should get tokens", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const coupons = await NFTSale.getTokens();

    const firstCoupon = await NFTSale.tokens(0);

    expect(firstCoupon.amount).to.equal(coupons[0].amount);
  });

  it("should get length of the tokens array", async () => {
    const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const couponsLength = await NFTSale.getTokensLength();

    expect(1).to.equal(couponsLength);
  });
});
