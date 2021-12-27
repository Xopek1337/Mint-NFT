const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  ethers: {
    BigNumber,
  },
} = require('hardhat');
const URI = 'https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png';

describe('ERC1155MintTest', () => {
  it('should mint', async () => {
    const [addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const collectionId = 1;
    const amount = 5;

    await erc1155.mint(collectionId, amount, addr1.address);

    const mintedCoupons = await erc1155.balanceOf(addr1.address, 1);

    expect(amount).to.equal(mintedCoupons);
  });
});