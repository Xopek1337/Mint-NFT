const hre = require("hardhat");

const network = hre.network.name;
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;
  const uri = process.env.NFT_URI;

  let dir = './networks/';
  const fileName = network + '.json';
  let data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: 'utf8' }));

  try {
    await hre.run("verify:verify", {
      address: data.passes,
      constructorArguments: [wallet, uri],
      contract: "contracts/mintingPass.sol:mintingPass",
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
