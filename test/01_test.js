const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('nftTest', function () {
  it('', async () => {
    const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
    const ERC721 = await ERC721Instance.deploy("BasicToken","BST");
    await ERC721.deployed();

    const nftSaleInstance = await ethers.getContractFactory("nftSale");
    const nftSale = await nftSaleInstance.deploy(ERC721.address, ERC721.address);
    await nftSale.deployed();
  });
});
