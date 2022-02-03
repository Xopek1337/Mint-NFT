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
which are listed in the 'package.json' file (for example, coverage (```npm install coverage```))

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

#### MintNFT
##### MintNFT Deploy
npx hardhat run scripts/05_1_MintNFT_deploy.js --network rinkeby

##### MintNFT Verify
npx hardhat run scripts/05_2_MintNFT_verify.js --network rinkeby

##### MintNFT Add manager or remove
npx hardhat run scripts/06_3_MintNFT_addManager.js --network rinkeby
npx hardhat run scripts/06_4_MintNFT_removeManager.js --network rinkeby

##### MintNFT pause and unpause
npx hardhat run scripts/06_1_MintNFT_pause.js --network rinkeby
npx hardhat run scripts/06_2_MintNFT_unpause.js --network rinkeby

##### MintNFT set public sale
npx hardhat run scripts/06_5_MintNFT_setPublicSale.js --network rinkeby

##### MintNFT add whitelist
1. Add addresses and amounts to whitelist/whitelist.json
2. Run script:
npx hardhat run scripts/06_6_MintNFT_addWhitelist.js --network rinkeby