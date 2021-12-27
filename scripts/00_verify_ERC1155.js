const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const token = process.env.NFT_URI;

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
