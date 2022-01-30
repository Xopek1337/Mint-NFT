const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const uri = process.env.NFT_URI;
  const wallet = process.env.WALLET;
  const receiver = process.env.RECEIVER;

  const dir = "./networks/";
  const fileNamePass = "MintingPass_" + `${network}.json`;
  const fileNameERC721 = 'ERC721Mint_' + `${network}.json`;
  const dataPass = JSON.parse(await fs.readFileSync(dir + fileNamePass, { encoding: "utf8" }));
  const dataERC721 = JSON.parse(await fs.readFileSync(dir + fileNameERC721, { encoding: "utf8" }));

  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.deploy(dataERC721.ERC721Mint, dataPass.passes, wallet, receiver);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`MintNFT smart contract has been deployed to: ${MintNFT.address}`);

  namesAndAddresses.MintNFT = MintNFT.address;
  namesAndAddresses.MintingPass = dataPass.passes;
  namesAndAddresses.ERC721Mint = dataERC721.ERC721Mint;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
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
