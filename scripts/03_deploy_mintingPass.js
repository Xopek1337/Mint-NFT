const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const wallet = process.env.WALLET;
  const uri = process.env.NFT_URI;

  const passesInstance = await ethers.getContractFactory("MintingPass");
  const passes = await passesInstance.deploy(wallet, uri);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`Passes smart contract has been deployed to: ${passes.address}`);

  namesAndAddresses.passes = passes.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
  const dir = "./networks/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = "MintingPass_" + `${network}.json`;

  await fs.writeFileSync(dir + fileName, data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
