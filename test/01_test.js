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
});