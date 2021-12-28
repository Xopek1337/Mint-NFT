const hre = require("hardhat");

const network = hre.network.name;
const fs = require("fs");

async function main() {
  const uri = process.env.NFT_URI;

  let dir = './networks/';
  const fileName = network + '.json';
  let data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: 'utf8' }));

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
