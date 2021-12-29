const network = hre.network.name;
const fs = require("fs");

async function main() {
  const namesAndAddresses = {};
  const [deployer] = await hre.ethers.getSigners();
  const wallet = process.env.WALLET;

  const dir = "./networks/";
  const fileName = "ERC1155_" + `${network}.json`;

  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));

  if ("SALE_TOKEN" in process.env) {
    namesAndAddresses.ERC1155 = process.env.SALE_TOKEN;
  } else {
    namesAndAddresses.ERC1155 = data.ERC1155;
  }

  const nftSaleInstance = await ethers.getContractFactory("NFTSale");
  const nftSale = await nftSaleInstance.deploy(wallet, namesAndAddresses.ERC1155);

  namesAndAddresses.nftSale = nftSale.address;

  const changedData = await JSON.stringify(namesAndAddresses, null, 2);

  console.log("Network", network);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log(`NFTSale smart contract has been deployed to: ${nftSale.address}`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const fileName2 = "NFTSale_" + `${network}.json`;

  await fs.writeFileSync(dir + fileName2, changedData, { encoding: "utf8" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
