const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();

  const uri = process.env.NFT_URI;

  const ERC1155Instance = await ethers.getContractFactory("ERC1155Mint");
  const ERC1155 = await ERC1155Instance.deploy("MineichToken","MNC", uri);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`ERC1155 smart contract has been deployed to: ${ERC1155.address}`);

  namesAndAddresses.ERC1155 = ERC1155.address;

  const data = await JSON.stringify(namesAndAddresses, null, 2);
  const dir = "./networks/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName = "ERC1155_" + `${network}.json`;

  await fs.writeFileSync(dir + fileName, data, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
