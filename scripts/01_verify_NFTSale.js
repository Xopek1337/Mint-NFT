const hre = require("hardhat");

const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.nftSale,
      constructorArguments: [wallet, data.ERC1155],
      contract: "contracts/NFTSale.sol:NFTSale",
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
