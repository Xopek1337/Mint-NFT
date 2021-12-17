const hre = require("hardhat");

const network = hre.network.name;
const delay = require("delay");
const { logger } = require("ethers");

async function main() {
  const [wallet] = await ethers.getSigners();

  const ERC721Instance = await ethers.getContractFactory("ERC721Mint");
  const ERC721 = await ERC721Instance.deploy("BasicToken", "BST");
  await ERC721.deployed();

  const nftSaleInstance = await ethers.getContractFactory("nftSale");
  const nftSale = await nftSaleInstance.deploy(wallet.address, ERC721.address);
  await nftSale.deployed();

  await delay(70000);

  await hre.run("verify:verify", {
    address: nftSale.address,
    constructorArguments: [wallet.address, ERC721.address],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
