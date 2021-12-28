const hre = require("hardhat");

const network = hre.network.name;
const fs = require("fs");
const { logger } = require("ethers");

async function main() {
  const namesAndAddresses = {};

  const wallet = process.env.WALLET;
  const uri = process.env.NFT_URI;

  const passesInstance = await ethers.getContractFactory("mintingPass");
  const passes = await passesInstance.deploy(wallet, uri);

  namesAndAddresses.passes = passes.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync("address.json", data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
