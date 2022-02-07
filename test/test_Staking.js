const { expect } = require("chai");
const { ethers } = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

describe("ERC721MintTest", () => {
  let Staking;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
  });

  describe("Testing constructor", () => {
    it("should set right constructor parametres", async () => {
      const ERC20TestInstance = await ethers.getContractFactory("ERC20Test");
      const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
      const StakingInstance = await ethers.getContractFactory("Staking");

      ERC20Test = await ERC20TestInstance.deploy("ERC20Test", "Test");
      ERC721Mint = await ERC721MintInstance.deploy(
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        process.env.NFT_URI,
      );
      Staking = await StakingInstance.deploy(ERC20Test.address, ERC721Mint.address);
    });
  });
  
  describe("Other tests", () => {
    beforeEach(async () => {
      const ERC20TestInstance = await ethers.getContractFactory("ERC20Test");
      const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
      const StakingInstance = await ethers.getContractFactory("Staking");
  
      ERC20Test = await ERC20TestInstance.deploy("ERC20Test", "Test");
      ERC721Mint = await ERC721MintInstance.deploy(
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        process.env.NFT_URI,
        );
      Staking = await StakingInstance.deploy(ERC20Test.address, ERC721Mint.address);
    });
      it('should stake', async () => {
        const startingBalance = await ERC721Mint.balanceOf(addr1.address);

        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.connect(addr1).approve(Staking.address, 0);
        await ERC721Mint.connect(addr1).approve(Staking.address, 1);

        const ids = [0, 1];
        await Staking.connect(addr1).stake(ids);

        const endingBalance = await ERC721Mint.balanceOf(addr1.address);

        expect(startingBalance).to.equal(endingBalance);
      });

      it('should fail stake if pause is turned on', async () => {
        const ids = [0, 1, 2, 3, 4, 5];

        await Staking._setPause(true);
        await expect(
          Staking.connect(addr1).stake(ids),
        ).to.be.revertedWith('Staking::stake: staking is closed');
      });

      it('should fail stake if token does not exist', async () => {
        const ids = [0, 1, 2, 3, 4, 5];

        await expect(
          Staking.connect(addr1).stake(ids),
        ).to.be.revertedWith('ERC721: owner query for nonexistent token');
      });

      it('should fail stake if msg.sender is not token owner', async () => {
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);

        const ids = [0, 1, 2];

        await expect(
          Staking.connect(addr2).stake(ids),
        ).to.be.revertedWith('Staking::stake: only token owner can stake');
      });

      /*it('should fail stake if msg.sender is not token owner', async () => {
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);

        const ids = [0, 1, 2];

        await expect(
          Staking.connect(addr2).stake(ids),
        ).to.be.revertedWith('Staking::stake: only token owner can stake');
      });*/

      it('should unstake', async () => {
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.mint(addr1.address);
        await ERC721Mint.connect(addr1).approve(Staking.address, 0);
        await ERC721Mint.connect(addr1).approve(Staking.address, 1);

        const startingBalance = await ERC721Mint.balanceOf(addr1.address);
        const ids = [0, 1];
        
        await Staking.connect(addr1).stake(ids);
        await Staking.connect(addr1).unstake(ids);

        const endingBalance = await ERC721Mint.balanceOf(addr1.address);

        expect(startingBalance).to.equal(endingBalance);
      });
  
      it('should turn on pause', async () => {
        await Staking._setPause(true);
  
        const isPaused = await Staking.isPaused();
  
        expect(true).to.equal(isPaused);
      });

      it('should fail turn on pause if msg.sender is not owner', async () => {
        await expect(
          ERC721Mint.connect(addr1)._setPause(true),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });
  });
});