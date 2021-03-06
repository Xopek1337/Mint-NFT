// npx hardhat run scripts/03_verify_mintingPass.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;
  const uri = process.env.NFT_URI;

  const dir = "./networks/";
  const fileName = "MintingPass_" + `${network}.json`;
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.passes,
      constructorArguments: [wallet, uri],
      contract: "contracts/MintingPass.sol:MintingPass",
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
