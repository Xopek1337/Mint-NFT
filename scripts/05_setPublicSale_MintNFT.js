// npx hardhat run scripts/05_setPublicSale_MintNFT.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const dir = "./networks/";
  const fileName = "MintNFT_" + `${network}.json`;
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.attach(data.MintNFT);

  const tx = await MintNFT._setPublicSale(true);
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
