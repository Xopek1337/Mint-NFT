const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");
const { logger } = require("ethers");

async function main() {
  const wallet = process.env.WALLET;
  const token = process.env.NFT_URI;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.coupons,
      constructorArguments: [wallet, token],
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
