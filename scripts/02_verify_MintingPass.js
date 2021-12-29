// $ npx hardhat run scripts/02_verify_MintingPass.js --network rinkeby
const hre = require("hardhat");
const network = hre.network.name;
const fs = require("fs");

async function main() {

    // Get addresses from file

    let dir = './networks/';
    const fileName = network + '.json';
    let data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: 'utf8' }));

    const wallet = process.env.WALLET;
    const uri = process.env.MINTING_PASS_URI;

    // Verify block

    // Minting pass contract verify
    try {
        await hre.run("verify:verify", {
            address: data.mintingPass,
            constructorArguments: [wallet, uri],
            contract: "contracts/MintingPass.sol:MintingPass"
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
