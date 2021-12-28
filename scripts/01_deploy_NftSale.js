const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};

  const wallet = process.env.WALLET;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  const nftSaleInstance = await ethers.getContractFactory("NFTSale");
  const nftSale = await nftSaleInstance.deploy(wallet, data.ERC1155);

  namesAndAddresses.nftSale = nftSale.address;
  namesAndAddresses.ERC1155 = data.ERC1155;

  const changedData = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync("address.json", changedData, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
