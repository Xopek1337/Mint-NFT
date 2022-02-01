require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("hardhat-deploy");

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
      url: process.env.RPC_NODE_URL_RINKEBY,
      gas: 2100000,
      gasPrice: 8000000000,
      accounts: [process.env.PRIVATE_KEY]
    },
    matic: {
      url: "RPC_NODE_URL_MUMBAI",
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.RPC_NODE_URL_MAINNET,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY
  }
};
