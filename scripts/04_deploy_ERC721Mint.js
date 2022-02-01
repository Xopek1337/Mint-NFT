// $ npx hardhat run scripts/04_deploy_ERC721Mint.js --network rinkeby
const network = hre.network.name;
const fs = require('fs');

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const ERC721MintInstance = await ethers.getContractFactory('ERC721Mint');
  const ERC721Mint = await ERC721MintInstance.deploy(process.env.TOKEN_NAME, 
  process.env.TOKEN_SYMBOL, process.env.NFT_URI);

  console.log('Network', network);
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  console.log(`Smart contract has been deployed to: ${ERC721Mint.address}`);

  namesAndAddresses.ERC721Mint = ERC721Mint.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
  const dir = './networks/';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = 'ERC721Mint_' + `${network}.json`;

  await fs.writeFileSync(dir + fileName, data, { encoding: 'utf8' });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });