const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  ethers: {
    BigNumber,
  },
} = require('hardhat');
const URI = 'https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png';

describe('couponsV2Test', () => {
  it('should faile if contract is paused', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await expect(
      couponsV2.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther('6') }),
    ).to.be.revertedWith('Coupon::mint: contract is paused');
  });

  it('should faile if couponID does not exist', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setPause('true');

    await expect(
      couponsV2.connect(addr1).mint(8, 25, { value: ethers.utils.parseEther('0.25') }),
    ).to.be.revertedWith('Coupon::mint: CouponId does not exist');
  });

  it('should faile if not enough ether sent', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setPause('true');

    await expect(
      couponsV2.connect(addr1).mint(1, 100, { value: ethers.utils.parseEther('3.25') }),
    ).to.be.revertedWith('Coupon::mint: not enough ether sent');
  });

  it('should faile if not enough enough sepply', async () => {
    const [wallet, addr1] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setPause('true');

    await expect(
      couponsV2.connect(addr1).mint(1, 200, { value: ethers.utils.parseEther('12') }),
    ).to.be.revertedWith('Coupon::mint: not enough supply');
  });

  it('should bye one coupon from first collection', async () => {
    const [wallet, addr1] = await ethers.getSigners();
    const price = await BigNumber.from('600000000000000000');

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setPause('true');

    const startingBalance = await ethers.provider.getBalance(wallet.address);

    await couponsV2.connect(addr1).mint(1, 10, { value: ethers.utils.parseEther('0.6') });

    const endingBalance = await ethers.provider.getBalance(wallet.address);

    expect(startingBalance).to.equal(endingBalance.sub(price));
  });

  it('should turn on pause', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setPause('true');

    const isPaused = await couponsV2.isPaused();

    expect(true).to.equal(isPaused);
  });

  it('should change URI', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const uri = 'https://ipfs.io/ipfs/TTTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1?filename=Chainlink_Elf.png';

    await couponsV2._setNewURI(uri);

    const endingURI = await couponsV2.uri(1);

    expect(uri).to.equal(endingURI);
  });

  it('should change wallet', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    await couponsV2._setWallet(wallet.address);

    const endingWallet = await couponsV2.wallet();

    expect(endingWallet).to.equal(wallet.address);
  });

  it('should change couponData', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const couponId = 1;
    const amount = 320;
    const rate = ethers.utils.parseEther('0.1');

    await couponsV2._setCouponData(couponId, amount, rate);

    const couponStruct = await couponsV2.coupones(couponId);
    const finishAmount = couponStruct.amount;

    expect(amount).to.equal(finishAmount);
  });

  it('should faile if amounts length must not be equal rates length', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const amounts = [320, 300, 280, 260];
    const rates = [ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.3')];

    await expect(
      couponsV2.connect(wallet)._addCoupones(amounts, rates),
    ).to.be.revertedWith('Coupon::addCoupones: amounts length must be equal rates length');
  });

  it('should add coupons', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const amounts = [320, 300, 280];
    const rates = [ethers.utils.parseEther('0.1'), ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.3')];

    await couponsV2._addCoupones(amounts, rates);

    const newFirstCoupon = await couponsV2.coupones(6);
    const newFirstAmount = newFirstCoupon.amount;
    const newFirstRate = newFirstCoupon.rate;

    expect(newFirstAmount).to.equal(amounts[0]);
    expect(newFirstRate).to.equal(rates[0]);
  });

  it('should get coupons', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const coupons = await couponsV2.getCoupones();

    const firstCoupon = await couponsV2.coupones(0);

    expect(firstCoupon.amount).to.equal(coupons[0].amount);
  });

  it('should get length of the coupons array', async () => {
    const [wallet] = await ethers.getSigners();

    const couponsV2Instance = await ethers.getContractFactory('Coupon');
    const couponsV2 = await couponsV2Instance.deploy(wallet.address, URI);
    await couponsV2.deployed();

    const couponsLength = await couponsV2.getCouponesLength();

    expect(6).to.equal(couponsLength);
  });
});
