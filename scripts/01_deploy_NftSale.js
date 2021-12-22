const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};

  const wal = process.env.ACCOUNT_1;

  const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
  const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");

  const nftSaleInstance = await ethers.getContractFactory("NftSale");
  const nftSale = await nftSaleInstance.deploy(wal, ERC721.address);

  namesAndAddresses.nftSale = nftSale.address;
  namesAndAddresses.ERC721 = ERC721.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync("address.json", data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
