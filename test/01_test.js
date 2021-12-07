const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  }
} = require("hardhat");

describe('nftTest', function () {
  it('should mint 1 token and transfer it to account', async () => {
    const [wallet, addr1] = await ethers.getSigners();
    let price = await BigNumber.from('10000000000000000');

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await nftSale.connect(addr1).buyToken(1,{value: ethers.utils.parseEther("0.01")});

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it('should put 200 token in totalAmount', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = 200;

    await nftSale.setTotalSellAmount(amount);

    const endingTotalSellAmount = await nftSale.totalSellAmount();

    expect(amount).to.equal(endingTotalSellAmount);
  });

  it('should set 0.02 ether to price', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = ethers.utils.parseEther("0.02");

    await nftSale.setPrice(amount);

    const endingPrice = await nftSale.price();

    expect(amount).to.equal(endingPrice);
  });

  it('should put 20 token in maxBuyAmount', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const amount = 20;

    await nftSale.setMaxBuyAmount(amount);

    const endingMaxBuyAmount = await nftSale.maxBuyAmount();

    expect(amount).to.equal(endingMaxBuyAmount);
  });

  it('should change wallet address', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await nftSale.setWallet(wallet.address);

    const endingWallet = await nftSale.wallet();

    expect(wallet.address).to.equal(endingWallet);
  });

  it('should fail if amount can not exceed maxBuyAmount', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await expect(
      nftSale.connect(addr1).buyToken(11,{value: ethers.utils.parseEther("0.11")})
    ).to.be.revertedWith("amount can not exceed maxBuyAmount");

  });

  it('sended ether is must equal to price * amount', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    await expect(
      nftSale.connect(addr1).buyToken(3,{value: ethers.utils.parseEther("0.01")})
    ).to.be.revertedWith("sended ether is must equal to price * amount");
  });
});