// $ npx hardhat run scripts/01_deploy_MintingPass.js --network rinkeby
const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};

  const [deployer] = await hre.ethers.getSigners();

  console.log('Network', network);
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const wallet = process.env.WALLET;
  const uri = process.env.MINTING_PASS_URI;

  const MintingPass = await ethers.getContractFactory("MintingPass");
  const mintingPass = await MintingPass.deploy(wallet, uri);

  console.log(`MintingPass smart contract has been deployed to: ${mintingPass.address}`);

  namesAndAddresses.mintingPass = mintingPass.address;

  // Save addresses to file
  let data = await JSON.stringify(namesAndAddresses, null, 2);
  let dir = './networks/';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = network + '.json';

  await fs.writeFileSync(dir + fileName, data, { encoding: 'utf8' });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
