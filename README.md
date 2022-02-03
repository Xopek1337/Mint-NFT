### Description

This repository contains a project based on interaction with the erc1155 token using smart contracts.  
All functions of smart contracts from the 'contracts' folder are commented to improve understanding of their work.  
Also, smart contracts are fully tested, the tests are located in the tests folder. 

***

### Instalation

bash  
```yarn install```

### Usage

For further work, you will need to install in this project all all the necessary dependencies,  
which are listed in the 'package.json' file (for example, coverage (```yarn add coverage```))

### Compilation

```npx hardhat compile```

### Run tests and coverage 

```npx hardhat coverage```

### Deploying contract

```npx hardhat run scripts/ *select the file you want to run*``` 
--network rinkeby

### Verify a contract

```npx hardhat run scripts/ *select the file you want to run*``` 
--network rinkeby

***

### ERC721Mint
#### Deploy
```npx hardhat run scripts/04_deploy_ERC721Mint.js``` --network rinkeby

#### Verify
```npx hardhat run scripts/04_verify_ERC721Mint.js``` --network rinkeby

#### Set URI
```npx hardhat run scripts/04_setURI_ERC721Mint.js``` --network rinkeby

***

### MintNFT
#### Deploy
```npx hardhat run scripts/05_deploy_MintNFT.js``` --network rinkeby

#### Verify
```npx hardhat run scripts/05_verify_MintNFT.js``` --network rinkeby

#### Add manager or remove
```npx hardhat run scripts/05_addManager_MintNFT.js``` --network rinkeby  
```npx hardhat run scripts/05_removeManager_MintNFT.js``` --network rinkeby

#### Pause and unpause
```npx hardhat run scripts/05_pause_MintNFT.js``` --network rinkeby  
```npx hardhat run scripts/05_unpause_MintNFT.js``` --network rinkeby

#### Set public sale
```npx hardhat run scripts/05_setPublicSale_MintNFT.js``` --network rinkeby

#### Add whitelist
1. Add addresses and amounts to whitelist/whitelist.json
2. Run script:
```npx hardhat run scripts/05_addWhitelist_MintNFT.js``` --network rinkeby