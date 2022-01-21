const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

const URI = "https://gateway.pinata.cloud/ipfs/QmPhNgR9i4PFtwhaXtf88iNTaq6Lnxs2Y6XxyH27AZmkYE";

describe("NFTSaleTest", () => {
    let erc1155;
    let NFTSale;

  beforeEach(async () => {
    [wallet, wallet2, addr1, addr2] = await ethers.getSigners();
  });

  describe("Testing the existence of a wallet", () => {
    beforeEach(async () => {
      const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
      erc1155 = await erc1155Instance.deploy("MineichToken","MNC", URI);
    });

    it("should faile if wallet does not exist", async () => {
      const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
      await expect(
        NFTSaleInstance.deploy(constants.ZERO_ADDRESS, erc1155.address),
      ).to.be.revertedWith("NFTSale::constructor: wallet does not exist");
    });
  });

  describe("Other tests", () => {
    beforeEach(async () => {
      const erc1155Instance = await ethers.getContractFactory("ERC1155Mint");
      erc1155 = await erc1155Instance.deploy("MineichToken","MNC", URI);
      const NFTSaleInstance = await ethers.getContractFactory("NFTSale");
      NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    });

    it("should fail if nonSaleMode is activated", async () => {
      await expect(
        NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.03") }),
      ).to.be.revertedWith("NFTSale::buyToken: sales are closed");
    });

    it("should fail if not enough supply with PreSaleMode", async () => {
      await NFTSale._setSellingMode(false, true);

      await NFTSale._setBundleData(0, 5, ethers.utils.parseEther("0.01"));

      await NFTSale._whitelistAdd(addr1.address, 8);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") }),
      ).to.be.revertedWith("NFTSale::buyToken: not enough supply");
    });

    it("should fail if not enough allowed supply with PreSaleMode", async () => {
      await erc1155.setManager(NFTSale.address);

      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 8);

      await NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") });
      await expect(
        NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") }),
      ).to.be.revertedWith("NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should fail if not enough supply with SaleMode", async () => {
      await NFTSale._setSellingMode(true, false);

      await NFTSale._setBundleData(0, 5, ethers.utils.parseEther("0.01"));

      await expect(
        NFTSale.connect(addr1).buyToken(0, 8, { value: ethers.utils.parseEther("0.08") }),
      ).to.be.revertedWith("NFTSale::buyToken: not enough supply");
    });

    it("should bye one coupon from first bundle with PreSaleMode", async () => {
      const price = await BigNumber.from("20000000000000000");

      await erc1155.setManager(NFTSale.address);

      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 8);

      const startingBalance = await ethers.provider.getBalance(wallet.address);

      await NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.02") });

      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingBalance).to.equal(endingBalance.sub(price));
    });

    it("should bye one coupon from first bundle with SaleMode", async () => {
      const price = await BigNumber.from("20000000000000000");

      await erc1155.setManager(NFTSale.address);

      await NFTSale._setSellingMode(true, false);

      const startingBalance = await ethers.provider.getBalance(wallet.address);

      await NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.02") });

      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingBalance).to.equal(endingBalance.sub(price));
    });

    it("should fail if amount is more than allowed", async () => {
      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 8);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.09") }),
      ).to.be.revertedWith("NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should fail if you are not logged into whitelist", async () => {
      await NFTSale._setSellingMode(false, true);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther("0.09") }),
      ).to.be.revertedWith("NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should fail is amount is more than maxBuyAmount with PreSaleMode", async () => {
      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 15);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 12, { value: ethers.utils.parseEther("0.12") }),
      ).to.be.revertedWith("NFTSale::buyToken: amount can not exceed maxBuyAmount");
    });

    it("should fail is amount is more than maxBuyAmount with SaleMode", async () => {
      await NFTSale._setSellingMode(true, false);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 12, { value: ethers.utils.parseEther("0.12") }),
      ).to.be.revertedWith("NFTSale::buyToken: amount can not exceed maxBuyAmount");
    });

    it("should fail if bundle does not exist with PreSaleMode", async () => {
      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 8);

      await expect(
        NFTSale.connect(addr1).buyToken(2, 5, { value: ethers.utils.parseEther("0.05") }),
      ).to.be.revertedWith("NFTSale::buyToken: collection does not exist");
    });

    it("should fail if bundle does not exist with SaleMode", async () => {
      await NFTSale._setSellingMode(true, false);

      await expect(
        NFTSale.connect(addr1).buyToken(2, 5, { value: ethers.utils.parseEther("0.05") }),
      ).to.be.revertedWith("NFTSale::buyToken: collection does not exist");
    });

    it("should fail if not enough ether sent with PreSaleMode", async () => {
      await NFTSale._setSellingMode(false, true);

      await NFTSale._whitelistAdd(addr1.address, 8);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.01") }),
      ).to.be.revertedWith("NFTSale::buyToken: not enough ether sent");
    });

    it("should fail if not enough ether sent with SaleMode", async () => {
      await NFTSale._setSellingMode(true, false);

      await expect(
        NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther("0.01") }),
      ).to.be.revertedWith("NFTSale::buyToken: not enough ether sent");
    });

    it("should turn on preSaleMode", async () => {
      await NFTSale._setSellingMode(false, true);

      const preSale = await NFTSale.preSale();

      expect(true).to.equal(preSale);
    });

    it("should turn on saleMode", async () => {
      await NFTSale._setSellingMode(true, false);

      const sale = await NFTSale.sale();

      expect(true).to.equal(sale);
    });

    it("should turn on noneSaleMode", async () => {
      await NFTSale._setSellingMode(false, false);

      const preSale = await NFTSale.preSale();
      const sale = await NFTSale.sale();

      expect(false).to.equal(preSale);
      expect(false).to.equal(sale);
    });

    it("should add to whitelist", async () => {
      const amount = 10;

      await NFTSale._whitelistAdd(addr1.address, amount);

      const account = await NFTSale.Accounts(addr1.address);

      expect(amount).to.equal(account.allowed);
    });

    it("should change maxBuyAmount", async () => {
      const amount = 15;

      await NFTSale._setMaxBuyAmount(amount);

      const endingAmount = await NFTSale.maxBuyAmount();

      expect(amount).to.equal(endingAmount);
    });

    it("should change wallet", async () => {
      await NFTSale._setWallet(wallet2.address);

      const endingWallet = await NFTSale.wallet();

      expect(endingWallet).to.equal(wallet2.address);
    });

    it("should change tokenData", async () => {
      const couponId = 0;
      const amount = 320;
      const rate = ethers.utils.parseEther("0.1");

      await NFTSale._setBundleData(couponId, amount, rate);

      const couponStruct = await NFTSale.bundles(couponId);
      const finishAmount = couponStruct.amount;

      expect(BigNumber.from(amount)).to.equal(finishAmount);
    });

    it("should faile if amounts length must not be equal rates length", async () => {
      const amounts = [320, 300, 280, 260];
      const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3")];

      await expect(
        NFTSale._addBundles(amounts, rates),
      ).to.be.revertedWith("NFTSale::addBundles: amounts length must be equal rates length");
    });

    it("should faile if amounts length must not be equal rates length", async () => {
      await expect(
        NFTSale._setSellingMode(true, true),
      ).to.be.revertedWith("NFTSale::setSellingMode: can not set 2 selling mode at once");
    });

    it("should add tokens", async () => {
      const amounts = [320, 300, 280, 100];
      const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3"), ethers.utils.parseEther("0.05")];

      await NFTSale._addBundles(amounts, rates);

      const newFirstCoupon = await NFTSale.bundles(1);
      const newFirstAmount = newFirstCoupon.amount;
      const newFirstRate = newFirstCoupon.rate;

      expect(newFirstAmount).to.equal(amounts[0]);
      expect(newFirstRate).to.equal(rates[0]);
    });

    it("should get tokens", async () => {
      const coupons = await NFTSale.getBundles();

      const firstCoupon = await NFTSale.bundles(0);

      expect(firstCoupon.amount).to.equal(coupons[0].amount);
    });

    it("should get length of the bundles array", async () => {
      const couponsLength = await NFTSale.getBundlesLength();

      expect(1).to.equal(couponsLength);
    });
  });
});
