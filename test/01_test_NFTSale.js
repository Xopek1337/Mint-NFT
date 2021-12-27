const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");
const URI = 'https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png';

describe("NFTSaleTest", () => {
  it('should fail if nonSaleMode is activated', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await expect(
      NFTSale.connect(addr1).buyToken(1, 100, { value: ethers.utils.parseEther('3') }),
    ).to.be.revertedWith('::buyToken: sales are closed');
  });

  it('should fail if not enough supply', async () => { 
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();
    await NFTSale.changeCouponAmount(0,5);
    
    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther('0.01') }),
    ).to.be.revertedWith('NFTSale::buyToken: not enough ether sent');
  });

  it('should bye one coupon from first collection', async () => {
    const [wallet, addr1] = await ethers.getSigners();
    const price = await BigNumber.from('10000000000000000');

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();
    
    await NFTSale.whitelistAdd(addr1.address, 8);

    await NFTSale.connect(addr1).buyToken(0, 1, { value: ethers.utils.parseEther('0.01') });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));

  });

  it('should fail if amount is more than allowed or you are not logged into whitelist', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();
    
    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 9, { value: ethers.utils.parseEther('0.05') }),
    ).to.be.revertedWith('NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist');
  });
  
  it('should fail is amount is more than maxBuyAmount', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();

    await NFTSale.whitelistAdd(addr1.address, 15);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 12, { value: ethers.utils.parseEther('0.12') }),
    ).to.be.revertedWith('NFTSale::buyToken: amount can not exceed maxBuyAmount');
  });

  it('should fail if collection does not exist', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();
    
    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(2, 5, { value: ethers.utils.parseEther('0.05') }),
    ).to.be.revertedWith('NFTSale::buyToken: collection does not exist');
  });

  it('should fail if not enough ether sent', async () => { 
    const [wallet, addr1] = await ethers.getSigners();

    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();

    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    await NFTSale.setPreSaleMode();
    
    await NFTSale.whitelistAdd(addr1.address, 8);

    await expect(
      NFTSale.connect(addr1).buyToken(0, 2, { value: ethers.utils.parseEther('0.01') }),
    ).to.be.revertedWith('NFTSale::buyToken: not enough ether sent');
  });

  it('should turn on preSaleMode', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    await NFTSale.setPreSaleMode();
    
    const preSale = await NFTSale.preSale();
    
    expect(true).to.equal(preSale);
  });
    
  it('should turn on saleMode', async () => {
    const [wallet] = await ethers.getSigners();
  
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    await NFTSale.setSaleMode();
    
    const sale = await NFTSale.sale();
    
    expect(true).to.equal(sale);
  });

  it('should turn on noneSaleMode', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    await NFTSale.setNonSaleMode();
    
    const preSale = await NFTSale.preSale();
    const sale = await NFTSale.sale();
    
    expect(false).to.equal(preSale);
    expect(false).to.equal(sale);
  });

  it('should add to whitelist', async () => {
    const [wallet, addr1] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const amount = 10;
    
    await NFTSale.whitelistAdd(addr1.address, amount);

    const account = await NFTSale.Accounts(addr1.address);
    
    expect(amount).to.equal(account.allowedAmount);
  });

  it('should change couponPrice of the collection', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    const collectionId = 0;
    const price = ethers.utils.parseEther('0.05');

    await NFTSale.changeCouponPrice(collectionId, price);

    const endingPrice = await NFTSale.rates(0);
    
    expect(price).to.equal(endingPrice);
  });

  it('should change couponAmount of the collection', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    const collectionId = 0;
    const amount = 150;

    await NFTSale.changeCouponAmount(collectionId, amount);
    
    const endingAmount = await NFTSale.supplies(0);
    
    expect(amount).to.equal(endingAmount);
  });

  it('should change maxBuyAmount', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    const amount = 15;

    await NFTSale.setMaxBuyAmount(amount);
    
    const endingAmount = await NFTSale.maxBuyAmount();
    
    expect(amount).to.equal(endingAmount);
  });

  it('should change wallet', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();
    
    await NFTSale.setWallet(wallet.address);

    const endingWallet = await NFTSale.wallet();
    
    expect(endingWallet).to.equal(wallet.address);
  });

  it('should fail if supplies length must not be equal rates length', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const supplies = [150, 120, 320];
    const rates = [ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.2')];

    await expect(
      NFTSale.connect(wallet).addCoupons(supplies, rates),
    ).to.be.revertedWith('NFTSale::addCoupons: amounts length must be equal rates length');
  });

  it('should add coupons', async () => {
    const [wallet] = await ethers.getSigners();
    
    const erc1155Instance = await ethers.getContractFactory('ERC1155Mint');
    const erc1155 = await erc1155Instance.deploy(URI);
    await erc1155.deployed();
    
    const NFTSaleInstance = await ethers.getContractFactory('NFTSale');
    const NFTSale = await NFTSaleInstance.deploy(wallet.address, erc1155.address);
    await NFTSale.deployed();

    const supplies = [150, 120];
    const rates = [ethers.utils.parseEther('0.15'), ethers.utils.parseEther('0.2')];
  
    await NFTSale.addCoupons(supplies, rates);
    
    const endingSupplies = await NFTSale.supplies(1);
    const endingRates = await NFTSale.rates(1);

    expect(supplies[0]).to.equal(endingSupplies);
    expect(rates[0]).to.equal(endingRates);
  });
});
