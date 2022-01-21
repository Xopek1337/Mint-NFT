const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

const URI = "https://gateway.pinata.cloud/ipfs/QmPhNgR9i4PFtwhaXtf88iNTaq6Lnxs2Y6XxyH27AZmkYE";

describe("mintingPassTest", () => {
  let mintingPass;

    beforeEach(async () => {
    [wallet, wallet2, addr1] = await ethers.getSigners();
  });

  describe("Testing the existence of a wallet", () => {
    it("should faile if wallet does not exist", async () => {
      const mintingPassInstance = await ethers.getContractFactory("MintingPass");

      await expect(
        mintingPassInstance.deploy(constants.ZERO_ADDRESS, URI),
      ).to.be.revertedWith("MintingPass::constructor: wallet does not exist");
    });
  });

  describe("Other tests", () => {
    beforeEach(async () => {
      const mintingPassInstance = await ethers.getContractFactory("MintingPass");
      mintingPass = await mintingPassInstance.deploy(wallet.address, URI)
    });
    it("should faile if contract is paused", async () => {
      await expect(
        mintingPass.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("6") }),
      ).to.be.revertedWith("MintingPass::mint: contract is paused");
    });

    it("should faile if passId does not exist", async () => {
      await mintingPass._setPause(false);

      await expect(
        mintingPass.connect(addr1).mint(8, 25, { value: ethers.utils.parseEther("0.25") }),
      ).to.be.revertedWith("MintingPass::mint: passId does not exist");
    });

    it("should faile if not enough ether sent", async () => {
      await mintingPass._setPause(false);

      await expect(
        mintingPass.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("3.25") }),
      ).to.be.revertedWith("MintingPass::mint: not enough ether sent");
    }); 

    it("should faile if not enough enough sepply", async () => {
      await mintingPass._setPause(false);

      await expect(
        mintingPass.connect(addr1).mint(1, 200, { value: ethers.utils.parseEther("12") }),
      ).to.be.revertedWith("MintingPass::mint: not enough supply");
    });

    it("should bye one pass from first collection", async () => {
      const price = await BigNumber.from("600000000000000000");

      await mintingPass._setPause(false);

      const startingBalance = await ethers.provider.getBalance(wallet.address);

      await mintingPass.connect(addr1).mint(1, 10, { value: ethers.utils.parseEther("0.6") });

      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingBalance).to.equal(endingBalance.sub(price));
    });

    it("should turn on pause", async () => {
      await mintingPass._setPause(false);

      const isPaused = await mintingPass.isPaused();

      expect(false).to.equal(isPaused);
    });

    it("should change URI", async () => {
      await mintingPass._setNewURI(URI);

      const endingURI = await mintingPass._uri();

      expect(URI).to.equal(endingURI);
    });

    it("should return IPFS URL", async () => {
      const answer = await mintingPass.uri(0);
  
      expect(URI + "/0").to.equal(answer);
    });

    it("should change wallet", async () => {
      await mintingPass._setWallet(wallet2.address);

      const endingWallet = await mintingPass.wallet();

      expect(endingWallet).to.equal(wallet2.address);
    });

    it("should change passData", async () => {
      const couponId = 1;
      const amount = 320;
      const rate = ethers.utils.parseEther("0.1");

      await mintingPass._setPassData(couponId, amount, rate);

      const couponStruct = await mintingPass.passes(couponId);
      const finishAmount = couponStruct.amount;

      expect(amount).to.equal(finishAmount);
    });

    it("should faile if amounts length must not be equal rates length", async () => {

      const amounts = [320, 300, 280, 260];
      const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3")];

      await expect(
        mintingPass.connect(wallet)._addPasses(amounts, rates),
      ).to.be.revertedWith("MintingPass::addPasses: amounts length must be equal rates length");
    });

    it("should add passes", async () => {
      const amounts = [320, 300, 280, 100];
      const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3"), ethers.utils.parseEther("0.05")];

      await mintingPass._addPasses(amounts, rates);

      const newFirstPass = await mintingPass.passes(6);
      const newFirstAmount = newFirstPass.amount;
      const newFirstRate = newFirstPass.rate;

      expect(newFirstAmount).to.equal(amounts[0]);
      expect(newFirstRate).to.equal(rates[0]);
    });

    it("should get passes", async () => {
      const passes = await mintingPass.getPasses();

      const firstPass = await mintingPass.passes(0);

      expect(firstPass.amount).to.equal(passes[0].amount);
    });

    it("should get length of the passes array", async () => {
      const passesLength = await mintingPass.getPassesLength();

      expect(6).to.equal(passesLength);
    });
  });
});
