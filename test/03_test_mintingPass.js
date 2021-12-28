const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");

const URI = "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png";

describe("mintingPassTest", () => {
  beforeEach(async function () {
    [wallet, addr1] = await ethers.getSigners();
  });
  it("should faile if contract is paused", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await expect(
      mintingPass.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("6") }),
    ).to.be.revertedWith("mintingPass::mint: contract is paused");
  });

  it("should faile if passId does not exist", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setPause("true");

    await expect(
      mintingPass.connect(addr1).mint(8, 25, { value: ethers.utils.parseEther("0.25") }),
    ).to.be.revertedWith("mintingPass::mint: passId does not exist");
  });

  it("should faile if not enough ether sent", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setPause("true");

    await expect(
      mintingPass.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther("3.25") }),
    ).to.be.revertedWith("mintingPass::mint: not enough ether sent");
  });

  it("should faile if not enough enough sepply", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setPause("true");

    await expect(
      mintingPass.connect(addr1).mint(1, 200, { value: ethers.utils.parseEther("12") }),
    ).to.be.revertedWith("mintingPass::mint: not enough supply");
  });

  it("should bye one pass from first collection", async () => {
    const price = await BigNumber.from("600000000000000000");

    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setPause("true");

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await mintingPass.connect(addr1).mint(1, 10, { value: ethers.utils.parseEther("0.6") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it("should turn on pause", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setPause("true");

    const isPaused = await mintingPass.isPaused();

    expect(true).to.equal(isPaused);
  });

  it("should change URI", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const uri = "https://ipfs.io/ipfs/TTTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png";

    await mintingPass._setNewURI(uri);

    const endingURI = await mintingPass.uri(1);

    expect(uri).to.equal(endingURI);
  });

  it("should change wallet", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    await mintingPass._setWallet(wallet.address);

    const endingWallet = await mintingPass.wallet();

    expect(endingWallet).to.equal(wallet.address);
  });

  it("should change passData", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const couponId = 1;
    const amount = 320;
    const rate = ethers.utils.parseEther("0.1");

    await mintingPass._setPassData(couponId, amount, rate);

    const couponStruct = await mintingPass.passes(couponId);
    const finishAmount = couponStruct.amount;

    expect(amount).to.equal(finishAmount);
  });

  it("should faile if amounts length must not be equal rates length", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const amounts = [320, 300, 280, 260];
    const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3")];

    await expect(
      mintingPass.connect(wallet)._addPasses(amounts, rates),
    ).to.be.revertedWith("mintingPass::addPasses: amounts length must be equal rates length");
  });

  it("should add passes", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const amounts = [320, 300, 280, 100];
    const rates = [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.3"), ethers.utils.parseEther("0.05")];

    await mintingPass._addPasses(amounts, rates);

    const newFirstPass= await mintingPass.passes(6);
    const newFirstAmount = newFirstPass.amount;
    const newFirstRate = newFirstPass.rate;

    expect(newFirstAmount).to.equal(amounts[0]);
    expect(newFirstRate).to.equal(rates[0]);
  });

  it("should get passes", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const passes = await mintingPass.getPasses();

    const firstPass = await mintingPass.passes(0);

    expect(firstPass.amount).to.equal(passes[0].amount);
  });

  it("should get length of the passes array", async () => {
    const mintingPassInstance = await ethers.getContractFactory("mintingPass");
    const mintingPass = await mintingPassInstance.deploy(wallet.address, URI);
    await mintingPass.deployed();

    const passesLength = await mintingPass.getPassesLength();

    expect(6).to.equal(passesLength);
  });
});
