const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    ethers: {
        BigNumber,
    },
} = require('hardhat');

describe('Minting pass test', () => {
  const initUri = 'https://api.cryptobots.me/api/mintingpass/';

  let mintingPass;
  let OWNER, MINTER, WALLET, otherAccounts;

  beforeEach(async () => {
    let MintingPass = await ethers.getContractFactory('MintingPass');

    [
      OWNER,
      MINTER,
      WALLET,
      ...otherAccounts
    ] = await ethers.getSigners();

    mintingPass = await MintingPass.deploy(WALLET.address, initUri);
  });

  describe('Deploy', async () => {
    it('Constructor checks', async () => {
      const [owner, wallet, uri, pause, name, symbol] = await Promise.all([
        mintingPass.owner(),
        mintingPass.wallet(),
        mintingPass.uri(2),
        mintingPass.isPaused(),
        mintingPass.name(),
        mintingPass.symbol(),
      ]);

      expect(owner).to.be.equal(OWNER.address);
      expect(wallet).to.be.equal(WALLET.address);
      expect(uri).to.be.equal(initUri + 2);
      expect(pause).to.be.equal(true);
      expect(name).to.be.equal("Cryptobots Presale Mint Pass");
      expect(symbol).to.be.equal("CPMP");

      let amount = '300';
      let rate = '0.03';
      let id = '0';

      let mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '150';
      rate = '0.06';
      id = '1';

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '100';
      rate = '0.09';
      id = '2';

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '75';
      rate = '0.15';
      id = '3';

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '30';
      rate = '0.3';
      id = '4';

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '15';
      rate = '0.9';
      id = '5';

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));
    });
  });

  describe('Mint', async () => {
    it('Simple mint', async () => {
      let id = '6';
      let value = ethers.utils.parseEther('16');
      let amount = '16';

      await expect(
        mintingPass.connect(MINTER).mint(id, amount, {value: value}),
      ).to.be.revertedWith('MintingPass::mint: contract is paused');

      await mintingPass._setPause(false);

      await expect(
        mintingPass.connect(MINTER).mint(id, amount, {value: value}),
      ).to.be.revertedWith('MintingPass::mint: mintingPassId does not exist');

      id = '5';

      await expect(
        mintingPass.connect(MINTER).mint(id, amount, {value: value}),
      ).to.be.revertedWith('MintingPass::mint: wrong ether amount');

      value = ethers.utils.parseEther('14.4');

      await expect(
        mintingPass.connect(MINTER).mint(id, amount, {value: value}),
      ).to.be.revertedWith('MintingPass::mint: not enough supply');

      amount = 15;
      value = ethers.utils.parseEther('13.5');

      const startWalletBalance = await ethers.provider.getBalance(WALLET.address);
      const startPassMinterBalance = await mintingPass.balanceOf(MINTER.address, id);

      await mintingPass.connect(MINTER).mint(id, amount, {value: value});

      const endWalletBalance = await ethers.provider.getBalance(WALLET.address);
      expect(endWalletBalance).to.equal(startWalletBalance.add(value));

      const endPassMinterBalance = await mintingPass.balanceOf(MINTER.address, id);
      expect(endPassMinterBalance).to.equal(startPassMinterBalance.add(amount));
    });
  });

  describe('Admin functions', async () => {
    it('Set pause by owner', async () => {
      let pause = await mintingPass.isPaused();
      expect(pause).to.equal(true);

      let value = false;
      await mintingPass._setPause(value);
      pause = await mintingPass.isPaused();
      expect(pause).to.equal(value);
    });

    it('Set pause by not owner (should be revert)', async () => {
      await expect(
        mintingPass.connect(MINTER)._setPause(false),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Set new URI by owner', async () => {
      let uri = await mintingPass.uri(4);
      expect(uri).to.equal(initUri + 4);

      let value = '123';
      await mintingPass._setNewURI(value);
      uri = await mintingPass.uri(3);
      expect(uri).to.equal(value + 3);
    });

    it('Set new URI by not owner (should be revert)', async () => {
      await expect(
        mintingPass.connect(MINTER)._setNewURI('123'),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Set wallet by owner', async () => {
      let wallet = await mintingPass.wallet();
      expect(wallet).to.equal(WALLET.address);

      let value = MINTER.address;
      await mintingPass._setWallet(value);
      wallet = await mintingPass.wallet();
      expect(wallet).to.equal(value);
    });

    it('Set wallet by not owner (should be revert)', async () => {
      await expect(
        mintingPass.connect(MINTER)._setWallet(MINTER.address),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Set minting pass data by owner', async () => {
      let amount = '300';
      let rate = '0.03';
      let id = '0';

      let mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));

      amount = '400';
      rate = '0';

      await mintingPass._setMintingPassData(id,amount,rate);

      mintingPassData = await mintingPass.mintingPasses(id);
      expect(mintingPassData[0]).to.equal(BigNumber.from(amount));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(ethers.utils.parseEther(rate));
    });

    it('Set minting pass data by not owner (should be revert)', async () => {
      await expect(
        mintingPass.connect(MINTER)._setMintingPassData('0','0','0'),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Add minting pass by owner', async () => {
      let length = '6';
      let mintingPassLength = await mintingPass.getMintingPassesLength();

      expect(mintingPassLength).to.equal(length);

      await mintingPass._addMintingPasses(['0','1'], ['0','1']);

      let id = '6';
      let mintingPassData = await mintingPass.mintingPasses(id);

      expect(mintingPassData[0]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(BigNumber.from('0'));

      id = '7';
      mintingPassData = await mintingPass.mintingPasses(id);

      expect(mintingPassData[0]).to.equal(BigNumber.from('1'));
      expect(mintingPassData[1]).to.equal(BigNumber.from('0'));
      expect(mintingPassData[2]).to.equal(BigNumber.from('1'));

      length = '8';
      mintingPassLength = await mintingPass.getMintingPassesLength();

      expect(mintingPassLength).to.equal(length);
    });

    it('Add minting pass by not owner (should be revert)', async () => {
      await expect(
        mintingPass.connect(MINTER)._addMintingPasses(['0'],['0']),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Getters', async () => {
    it('Get minting pass', async () => {
      const allMintingPasses = await mintingPass.getAllMintingPasses();

      let amount = '300';
      let rate = '0.03';

      expect(allMintingPasses[0].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[0].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[0].rate).to.equal(ethers.utils.parseEther(rate));

      amount = '150';
      rate = '0.06';

      expect(allMintingPasses[1].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[1].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[1].rate).to.equal(ethers.utils.parseEther(rate));

      amount = '100';
      rate = '0.09';

      expect(allMintingPasses[2].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[2].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[2].rate).to.equal(ethers.utils.parseEther(rate));

      amount = '75';
      rate = '0.15';

      expect(allMintingPasses[3].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[3].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[3].rate).to.equal(ethers.utils.parseEther(rate));

      amount = '30';
      rate = '0.3';

      expect(allMintingPasses[4].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[4].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[4].rate).to.equal(ethers.utils.parseEther(rate));

      amount = '15';
      rate = '0.9';

      expect(allMintingPasses[5].amount).to.equal(BigNumber.from(amount));
      expect(allMintingPasses[5].minted).to.equal(BigNumber.from('0'));
      expect(allMintingPasses[5].rate).to.equal(ethers.utils.parseEther(rate));
    });

    it('Get minting passes length', async () => {
      const length = '6';
      const mintingPassLength = await mintingPass.getMintingPassesLength();

      expect(mintingPassLength).to.equal(length);
    });
  });
});