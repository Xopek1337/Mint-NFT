const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");
const { logger } = require("ethers");

async function main() {
  const namesAndAddresses = {};

  const wal = process.env.ACCOUNT_1;

  const couponsInstance = await ethers.getContractFactory("Coupons");
  const coupons = await couponsInstance.deploy(wal, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");

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
