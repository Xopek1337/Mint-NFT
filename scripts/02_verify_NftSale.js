const hre = require("hardhat");
const network = hre.network.name;
const { logger } = require("ethers");
const fs = require('fs');

async function main() {
  let namesAndAddresses = {};

  const wal = "0x9e6a2A5Ac4D55eE0952aC3c09e6144353DD3d8DE";
  let data = JSON.parse(await fs.readFileSync('address.json', { encoding: 'utf8' }));

  try {
        await hre.run("verify:verify", {
            address: data.nftSale,
            constructorArguments: [wal, data.ERC721],
        });
    } catch (e) {
        console.log(e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });