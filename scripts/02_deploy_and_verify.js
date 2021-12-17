const hre = require("hardhat");

const network = hre.network.name;
const delay = require("delay");
const { logger } = require("ethers");

async function main() {
  const [wallet] = await ethers.getSigners();

  const couponsInstance = await ethers.getContractFactory("Coupons");
  const coupons = await couponsInstance.deploy(wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png");
  await coupons.deployed();

  await delay(100000);

  await hre.run("verify:verify", {
    address: coupons.address,
    constructorArguments: [wallet.address, "https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png"],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
