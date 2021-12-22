const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  
  const token = process.env.NFT;

  const ERC1155Instance = await ethers.getContractFactory("ERC1155Mint");
  const ERC1155 = await ERC1155Instance.deploy(token);

  namesAndAddresses.ERC1155 = ERC1155.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync("address.json", data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
