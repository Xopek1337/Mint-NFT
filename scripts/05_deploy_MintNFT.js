const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const uri = process.env.NFT_URI;
  const wallet = process.env.WALLET;
  const receiver = process.env.RECEIVER;

  const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
  const ERC721Mint = await ERC721MintInstance.deploy("LOL","LOL", uri);

  const MintingPassInstance = await ethers.getContractFactory("MintingPass");
  const MintingPass = await MintingPassInstance.deploy(wallet, uri);

  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.deploy(wallet, ERC721Mint.address, MintingPass.address, receiver);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`MintNFT smart contract has been deployed to: ${MintNFT.address}`);

  namesAndAddresses.MintNFT = MintNFT.address;
  namesAndAddresses.MintingPass = MintingPass.address;
  namesAndAddresses.ERC721Mint = ERC721Mint.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
  const dir = "./networks/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = "MintNFT_" + `${network}.json`;

  await fs.writeFileSync(dir + fileName, data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
