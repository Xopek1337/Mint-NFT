const network = hre.network.name;
const fs = require("fs");

async function main() {
  const newURI = process.env.NFT_URI;

  const dir = "./networks/";
  const fileName = "ERC721Mint_" + `${network}.json`;
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
  const ERC721Mint = await ERC721MintInstance.attach(data.ERC721Mint);

  const tx = await ERC721Mint._setURI(newURI);
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });