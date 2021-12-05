const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  }
} = require("hardhat");

describe('nftTest', function () {
  it('', async () => {
    const [wallet, addr1] = await ethers.getSigners();
    let price = await new ethers.BigNumber("0.01");

    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
    await nftSale.deployed();

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await nftSale.connect(addr1).buyToken(1,{value: ethers.utils.parseEther("0.01")});

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    console.log(endingBalance.sub(startingBalance).sub(price));

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });
});
