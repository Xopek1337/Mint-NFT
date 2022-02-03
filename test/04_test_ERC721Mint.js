const { expect } = require("chai");
const { ethers } = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

describe("ERC721MintTest", () => {
  let ERC721Mint;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
  });

  describe("Testing constructor", () => {
    it("should set right constructor parametres", async () => {
      const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
      ERC721Mint = await ERC721MintInstance.deploy(
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        process.env.NFT_URI,
      );

      const [name, symbol, uri] = await Promise.all([
        ERC721Mint.name(),
        ERC721Mint.symbol(),
        ERC721Mint.uri(),
      ]);

      const isOwnerManager = await ERC721Mint.managers(deployer.address);
      const tokenId = await ERC721Mint.tokenId();

      expect(name).to.be.equal(process.env.TOKEN_NAME);
      expect(symbol).to.be.equal(process.env.TOKEN_SYMBOL);
      expect(uri).to.equal(process.env.NFT_URI);
      expect(tokenId).to.equal(0);
      expect(isOwnerManager).to.equal(true);
    });
  });
  
  describe("Other tests", () => {
    beforeEach(async () => {
      const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
      ERC721Mint = await ERC721MintInstance.deploy(
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        process.env.NFT_URI,
      );
    });
    it("should add manager", async () => {
      await ERC721Mint._updateManagerList(addr1.address, true);

      const isManager = await ERC721Mint.managers(addr1.address);

      expect(isManager).to.equal(true);
    });

    it("should fail add manager if msg.sender is not owner", async () => {
      await expect(
        ERC721Mint.connect(addr1)._updateManagerList(addr2.address, true),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should remove manager", async () => {
      await ERC721Mint._updateManagerList(addr1.address, true);
      await ERC721Mint._updateManagerList(addr1.address, false);

      const isManager = await ERC721Mint.managers(addr2.address);

      expect(isManager).to.equal(false);
    });

    it("should fail remove manager if msg.sender is not owner", async () => {
      await expect(
        ERC721Mint.connect(addr1)._updateManagerList(addr2.address, false),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should mint", async () => {
      await ERC721Mint.mint(addr1.address);

      const tokenId = await ERC721Mint.tokenId();
      const balance = await ERC721Mint.balanceOf(addr1.address);

      expect(balance).to.equal(tokenId);
    });

    it("should fail mint if msg.sender is not manager", async () => {
      await expect(
        ERC721Mint.connect(addr1).mint(addr2.address),
      ).to.be.revertedWith("ERC721Mint: caller is not the manager");
    });

    it("should fail mint if recepient is the zero adress", async () => {
      await expect(
        ERC721Mint.mint(constants.ZERO_ADDRESS),
      ).to.be.revertedWith("ERC721: mint to the zero address");
    });

    it("should burn", async () => {
      const tokenId = await ERC721Mint.tokenId();
      const startingBalance = await ERC721Mint.balanceOf(addr1.address);

      await ERC721Mint.mint(addr1.address);
      await ERC721Mint.connect(addr1).burn(tokenId);

      const endingBalance = await ERC721Mint.balanceOf(addr1.address);

      expect(startingBalance).to.equal(endingBalance);
    });

    it("should fail burn if token does not exist", async () => {
      const tokenId = await ERC721Mint.tokenId();

      await expect(
        ERC721Mint.burn(tokenId),
      ).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it('should fail burn if msg.sender is not owner of token', async () => {
      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint.mint(addr1.address);

      await expect(
        ERC721Mint.connect(addr2).burn(tokenId),
      ).to.be.revertedWith('ERC721Mint:burn: only token owner can be burned');
    });

    it("should return URI of token", async () => {
      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint.mint(addr1.address);

      const result = await ERC721Mint.tokenURI(tokenId);

      expect(process.env.NFT_URI + tokenId).to.equal(result);
    });

    it("should fail return URI if token does not exist", async () => {
      const tokenId = await ERC721Mint.tokenId();

      await expect(
        ERC721Mint.connect(addr1).tokenURI(tokenId),
      ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    });

    it('should fail return URI if token was burned', async () => {
      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint.mint(addr1.address);
      await ERC721Mint.connect(addr1).burn(tokenId);

      await expect(
        ERC721Mint.connect(addr1).tokenURI(tokenId),
      ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    });

    it("should change URI", async () => {
      const newURI = "ExampleNewURI";

      await ERC721Mint._setURI(newURI);

      const endingURI = await ERC721Mint.uri();

      expect(newURI).to.equal(endingURI);
    });

    it("should fail change URI if msg.sender is not owner", async () => {
      const newURI = "ExampleNewURI";

      await expect(
        ERC721Mint.connect(addr1)._setURI(newURI),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('should change metadata', async () => {
      [newMetadata] = await ethers.getSigners();

      await ERC721Mint._setMetadata(newMetadata.address);

      const endingMetadata = await ERC721Mint.metadata();

      expect(newMetadata.address).to.equal(endingMetadata);
    });

    it("should fail change metadata if msg.sender is not owner", async () => {
      [newMetadata] = await ethers.getSigners();

      await expect(
        ERC721Mint.connect(addr1)._setMetadata(newMetadata.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('should turn on pause', async () => {
      await ERC721Mint._setPause(true);

      const isPaused = await ERC721Mint.isPaused();

      expect(true).to.equal(isPaused);
    });

    it('should fail turn on pause if msg.sender is not owner', async () => {
      await expect(
        ERC721Mint.connect(addr1)._setPause(true),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should transfer (transferFrom) one token from addr1 to addr2', async () => {
      const tokenId = await ERC721Mint.tokenId();

      const startingSenderBalance = await ERC20Test.balanceOf(addr1.address);
      const startingRecipientBalance = await ERC20Test.balanceOf(addr2.address);

      await ERC721Mint._updateManagerList(addr1.address, true);
      await ERC721Mint.connect(addr1).mint(addr1.address);
      await ERC721Mint.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);

      const endingSenderBalance = await ERC20Test.balanceOf(addr1.address);
      const endingRecipientBalance = await ERC20Test.balanceOf(addr2.address);

      expect(endingSenderBalance).to.equal(endingRecipientBalance - startingSenderBalance);
      expect(endingRecipientBalance).to.equal(startingRecipientBalance + startingSenderBalance);
    });

    it('should transfer (safeTransferFrom) one token from addr1 to addr2', async () => {
      const tokenId = await ERC721Mint.tokenId();

      const startingSenderBalance = await ERC20Test.balanceOf(addr1.address);
      const startingRecipientBalance = await ERC20Test.balanceOf(addr2.address);

      await ERC721Mint._updateManagerList(addr1.address, true);
      await ERC721Mint.connect(addr1).mint(addr1.address);
      await ERC721Mint.connect(addr1)['safeTransferFrom(address,address,uint256)'](addr1.address,
        addr2.address, tokenId);

      const endingSenderBalance = await ERC20Test.balanceOf(addr1.address);
      const endingRecipientBalance = await ERC20Test.balanceOf(addr2.address);

      expect(endingSenderBalance).to.equal(endingRecipientBalance - startingSenderBalance);
      expect(endingRecipientBalance).to.equal(startingRecipientBalance + startingSenderBalance);
    });

    it('should fail transferFrom if pause is turned on', async () => {
      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint._setPause(true);
      await ERC721Mint.mint(addr1.address);
      await expect(
        ERC721Mint.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
      ).to.be.revertedWith('ERC721Mint::transferFrom: transfers are closed');
    });

    it('should fail safeTransferFrom with 3 arguments if pause is turned on', async () => {
      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint._setPause(true);
      await ERC721Mint.mint(addr1.address);
      await expect(
        ERC721Mint.connect(addr1)['safeTransferFrom(address,address,uint256)'](addr1.address,
          addr2.address, tokenId),
      ).to.be.revertedWith('ERC721Mint::safeTransferFrom: transfers are closed');
    });

    it('should fail safeTransferFrom with 4 arguments if pause is turned on', async () => {
      const tokenId = await ERC721Mint.tokenId();
      const bytes = 252;

      await ERC721Mint._setPause(true);
      await ERC721Mint.mint(addr1.address);
      await expect(
        ERC721Mint.connect(addr1)['safeTransferFrom(address,address,uint256,bytes)'](addr1.address,
          addr2.address, tokenId, bytes),
      ).to.be.revertedWith('ERC721Mint::safeTransferFrom: transfers are closed');
    });

    beforeEach(async () => {
      const ERC20TestInstance = await ethers.getContractFactory("ERC20Test");
      const ERC721TestInstance = await ethers.getContractFactory("ERC721Test");

      ERC20Test = await ERC20TestInstance.deploy("ERC20Test", "Test");
      ERC721Test = await ERC721TestInstance.deploy("ERC721Test", "Test");
    });
    it("should withdraw erc20 tokens", async () => {
      const amount = 100;

      await ERC20Test.transfer(addr1.address, amount);

      const startingBalance = await ERC20Test.balanceOf(addr1.address);

      await ERC20Test.connect(addr1).transfer(ERC721Mint.address, amount);
      await ERC721Mint._withdrawERC20(ERC20Test.address, addr1.address);

      const endingBalance = await ERC20Test.balanceOf(addr1.address);

      expect(startingBalance).to.equal(endingBalance);
    });

    it("should fail withdraw erc20 tokens if msg.sender is not owner", async () => {
      await expect(
        ERC721Mint.connect(addr1)._withdrawERC20(ERC20Test.address, addr1.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should withdraw erc721 tokens", async () => {
      const tokenId = 5;

      await ERC721Test.transferFrom(deployer.address, addr1.address, tokenId);

      const startingBalance = await ERC721Test.balanceOf(addr1.address);

      await ERC721Test.connect(addr1).transferFrom(addr1.address, ERC721Mint.address, tokenId);
      await ERC721Mint._withdrawERC721(ERC721Test.address, addr1.address, tokenId);

      const endingBalance = await ERC721Test.balanceOf(addr1.address);

      expect(startingBalance).to.equal(endingBalance);
    });

    it("should fail withdraw erc721 tokens if msg.sender is not owner", async () => {
      const tokenId = 5;

      await expect(
        ERC721Mint.connect(addr1)._withdrawERC721(ERC721Test.address, addr1.address, tokenId),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
