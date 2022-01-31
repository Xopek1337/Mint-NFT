const network = hre.network.name;
const fs = require("fs");

async function main() {
  var adresses = [];
  var amounts = []
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

  await MintNFT._addWhitelist(adresses, amounts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });