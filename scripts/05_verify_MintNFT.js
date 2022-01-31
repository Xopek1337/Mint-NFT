// npx hardhat run scripts/05_verify_MintNFT.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const wallet = process.env.WALLET;
  const receiver = process.env.RECEIVER;

  const dir = "./networks/";
  const fileName = "MintNFT_" + `${network}.json`;
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  try {
    await hre.run("verify:verify", {
      address: data.MintNFT,
      constructorArguments: [data.ERC721Mint, data.MintingPass, wallet, receiver],
      contract: "contracts/MintNFT.sol:MintNFT",
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
