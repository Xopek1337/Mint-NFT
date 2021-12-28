const hre = require("hardhat");

const network = hre.network.name;
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;

  let dir = './networks/';
  const fileName = network + '.json';
  let data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: 'utf8' }));

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
