const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require('fs');

async function main() {
  let namesAndAddresses = {};

  const [wallet] = await ethers.getSigners();
  const wal = "0x9e6a2A5Ac4D55eE0952aC3c09e6144353DD3d8DE";

  const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
  const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");

  const nftSaleInstance = await ethers.getContractFactory("NftSale");
  const nftSale = await nftSaleInstance.deploy(wal, ERC721.address);

  namesAndAddresses.nftSale = nftSale.address;
  namesAndAddresses.ERC721 = ERC721.address;

  let data = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync('address.json', data, { encoding: 'utf8' });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
