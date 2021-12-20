const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");
const { logger } = require("ethers");

async function main() {
  const namesAndAddresses = {};

  const wal = process.env.ACCOUNT_1;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.coupons,
      constructorArguments: [wal, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png"],
    });
  } catch (e) {
    console.log(e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
