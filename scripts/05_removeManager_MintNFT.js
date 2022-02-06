// npx hardhat run scripts/05_removeManager_MintNFT.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const manager = process.env.MANAGER;

  const dir = "./networks/";
  const fileName = "MintNFT_" + `${network}.json`;
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.attach(data.MintNFT);

  const tx = await MintNFT.updateManagerList(manager, false);
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
