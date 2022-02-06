// npx hardhat run scripts/05_addWhitelist_MintNFT.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  let adresses = [];
  let amounts = []
  const dir = "./whitelist/";
  const fileName = "whitelist.json";
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  for(var k in data)
  {
    adresses.push(k);
    amounts.push(data[k]);
  }

  const dirNetwork = "./networks/";
  const fileNameMintNFT = "MintNFT_" + `${network}.json`;
  const dataMintNFT = JSON.parse(await fs.readFileSync(dirNetwork + fileNameMintNFT, { encoding: "utf8" }));

  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.attach(dataMintNFT.MintNFT);

  const tx = await MintNFT._addWhitelist(adresses, amounts);
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });