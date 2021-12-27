const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");
const { logger } = require("ethers");

async function main() {
  const namesAndAddresses = {};

  const wallet = process.env.WALLET;
  const token = process.env.NFT_URI;

  const couponsInstance = await ethers.getContractFactory("Coupons");
  const coupons = await couponsInstance.deploy(wallet, token);

  namesAndAddresses.coupons = coupons.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);

  await fs.writeFileSync("address.json", data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
