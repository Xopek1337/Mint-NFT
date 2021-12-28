const hre = require("hardhat");

const network = hre.network.name;
const { logger } = require("ethers");
const fs = require("fs");
const { userInfo } = require("os");

async function main() {
  const uri = process.env.NFT_URI;

  const data = JSON.parse(await fs.readFileSync("address.json", { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.ERC1155,
      constructorArguments: [uri],
      contract: "contracts/ERC1155Mint.sol:ERC1155Mint",
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
