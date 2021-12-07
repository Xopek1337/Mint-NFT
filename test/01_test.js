const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");

describe("nftTest", () => {
  it("should mint 1 token and transfer it to account", async () => {
    const [wallet, addr1] = await ethers.getSigners();
    const price = await BigNumber.from("10000000000000000");

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await nftSale.connect(addr1).buyToken(1, { value: ethers.utils.parseEther("0.01") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it("should put 200 token in totalAmount", async () => {
    const [wallet] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = 200;

    await nftSale.setTotalSellAmount(amount);

    const endingTotalSellAmount = await nftSale.totalSellAmount();

    expect(amount).to.equal(endingTotalSellAmount);
  });

  it("should set 0.02 ether to price", async () => {
    const [wallet] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = ethers.utils.parseEther("0.02");

    await nftSale.setPrice(amount);

    const endingPrice = await nftSale.price();

    expect(amount).to.equal(endingPrice);
  });

  it("should put 20 token in maxBuyAmount", async () => {
    const [wallet] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = 20;

    await nftSale.setMaxBuyAmount(amount);

    const endingMaxBuyAmount = await nftSale.maxBuyAmount();

    expect(amount).to.equal(endingMaxBuyAmount);
  });

  it("should change wallet address", async () => {
    const [wallet] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await nftSale.setWallet(wallet.address);

    const endingWallet = await nftSale.wallet();

    expect(wallet.address).to.equal(endingWallet);
  });

  it("should fail if amount can not exceed maxBuyAmount", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await expect(
      nftSale.connect(addr1).buyToken(11, { value: ethers.utils.parseEther("0.11") }),
    ).to.be.revertedWith("NftSale::buyToken: amount can not exceed maxBuyAmount");
  });

  it("sended ether is must equal to price * amount", async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await expect(
      nftSale.connect(addr1).buyToken(3, { value: ethers.utils.parseEther("0.01") }),
    ).to.be.revertedWith("NftSale::buyToken: sended ether is must equal to price * amount");
  });

  it("amount of sended tokens should not exceed totalSellAmount", async () => {
    const [wallet, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9,
      addr10, addr11] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await nftSale.connect(addr1).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr2).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr3).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr4).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr5).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr6).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr7).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr8).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr9).buyToken(10, { value: ethers.utils.parseEther("0.10") });
    await nftSale.connect(addr10).buyToken(10, { value: ethers.utils.parseEther("0.10") });

    await expect(
      nftSale.connect(addr11).buyToken(10, { value: ethers.utils.parseEther("0.10") }),
    ).to.be.revertedWith("NftSale::buyToken: amount of sended tokens can not exceed totalSellAmount");
  });

  it("should mint 3,2,4 tokens and transfer it to accounts", async () => {
    const [wallet, addr1, addr2, addr3] = await ethers.getSigners();
    const price = await BigNumber.from("90000000000000000");

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("NftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await nftSale.connect(addr1).buyToken(3, { value: ethers.utils.parseEther("0.03") });
    await nftSale.connect(addr2).buyToken(2, { value: ethers.utils.parseEther("0.02") });
    await nftSale.connect(addr3).buyToken(4, { value: ethers.utils.parseEther("0.04") });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });
});
