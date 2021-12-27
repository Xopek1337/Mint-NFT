require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: process.env.RPC_NODE_RINKEBY,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.RPC_NODE_MAINNET,
      accounts: [process.env.PRIVATE_KEY]
    },
    bsc: {
      url: process.env.RPC_NODE_BSC, 
      accounts: [process.env.PRIVATE_KEY]
    },
    bsctestnet: {
      url: process.env.RPC_NODE_BSCTESTNET, 
      accounts: [process.env.PRIVATE_KEY]
    },
    matic: {
      url: process.env.RPC_NODE_MATIC, 
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.RPC_NODE_MUMBAI, 
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY
  }
};
