const hre = require("hardhat");

const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");
const { userInfo } = require("os");

async function main() {
  const namesAndAddresses = {};

  const uri = process.env.NFT_URI;

  const ERC1155Instance = await ethers.getContractFactory("ERC1155Mint");
  const ERC1155 = await ERC1155Instance.deploy(uri);

  namesAndAddresses.ERC1155 = ERC1155.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
  file = "address.json";
  await fs.writeFileSync("address.json", data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
