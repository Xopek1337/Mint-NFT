// npx hardhat run scripts/05_deploy_MintNFT.js --network rinkeby
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const wallet = process.env.WALLET;
  const receiver = process.env.RECEIVER;
  const ERC721Mint = process.env.ERC721_MINT_ADDRESS;
  const MintingPass = process.env.MINTING_PASS_ADDRESS;

  const dir = "./networks/";
  const MintNFTInstance = await ethers.getContractFactory("MintNFT");
  const MintNFT = await MintNFTInstance.deploy(ERC721Mint, MintingPass, wallet, receiver);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`MintNFT smart contract has been deployed to: ${MintNFT.address}`);

  namesAndAddresses.MintNFT = MintNFT.address;
  namesAndAddresses.MintingPass = MintingPass;
  namesAndAddresses.ERC721Mint = ERC721Mint;

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
