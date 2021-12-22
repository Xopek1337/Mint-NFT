const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;
  const token = process.env.NFT;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.ERC1155,
      constructorArguments: [token],
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
