const { expect } = require("chai");
const { ethers } = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

describe("ERC721MintTest", () => {
  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
  });
  describe("Testing constructor", () => {
    it("should set right constructor parametres", async () => {
      const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
      ERC721Mint = await ERC721MintInstance.deploy(
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        process.env.URI,
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
      expect(uri).to.equal(process.env.URI);
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
        process.env.URI,
      );
    });
    it("should add manager", async () => {
      await ERC721Mint._addManager(addr1.address);

      const isManager = await ERC721Mint.managers(addr1.address);

      expect(isManager).to.equal(true);
    });

    it("should fail add manager if msg.sender is not owner", async () => {
      await expect(
        ERC721Mint.connect(addr1)._addManager(addr2.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail add manager if address is already a manager", async () => {
      await ERC721Mint._addManager(addr2.address);

      await expect(
        ERC721Mint._addManager(addr2.address),
      ).to.be.revertedWith("ERC721Mint::_addManager: is already a manager");
    });

    it("should remove manager", async () => {
      await ERC721Mint._addManager(addr1.address);
      await ERC721Mint._removeManager(addr1.address);

      const isManager = await ERC721Mint.managers(addr2.address);

      expect(isManager).to.equal(false);
    });

    it("should fail remove manager if msg.sender is not owner", async () => {
      await expect(
        ERC721Mint.connect(addr1)._addManager(addr2.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail remove manager if address is not a manager", async () => {
      await expect(
        ERC721Mint._removeManager(addr2.address),
      ).to.be.revertedWith("ERC721Mint::_removeManager: is not a manager");
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

    it("should fail mint if token is already minted", async () => {
      await ERC721Mint.mint(addr1.address);

      await ERC721Mint.mint(addr1.address);

      await expect(
        ERC721Mint.connect(addr1).mint(addr2.address),
      ).to.be.revertedWith("ERC721Mint: caller is not the manager");
    });

    it("should burn", async () => {
      const tokenIdBeforeMint = await ERC721Mint.tokenId();

      await ERC721Mint.mint(addr1.address);

      const tokenIdAfterMint = await ERC721Mint.tokenId();

      await ERC721Mint.burn(tokenIdAfterMint);

      const balance = await ERC721Mint.balanceOf(addr1.address);

      expect(balance).to.equal(tokenIdBeforeMint);
    });

    it("should fail burn if token does not exist", async () => {
      const tokenId = await ERC721Mint.tokenId();

      await expect(
        ERC721Mint.burn(tokenId),
      ).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it("should fail burn if msg.sender is not manager", async () => {
      await ERC721Mint.mint(addr1.address);

      const tokenId = await ERC721Mint.tokenId();

      await expect(
        ERC721Mint.connect(addr1).burn(tokenId),
      ).to.be.revertedWith("ERC721Mint: caller is not the manager");
    });

    it("should return URI of token", async () => {
      await ERC721Mint.mint(addr1.address);

      const tokenId = await ERC721Mint.tokenId();
      const result = await ERC721Mint.tokenURI(tokenId);

      expect(process.env.URI + tokenId).to.equal(result);
    });

    it("should fail return URI if token does not exist", async () => {
      const tokenId = await ERC721Mint.tokenId();

      await expect(
        ERC721Mint.connect(addr1).tokenURI(tokenId),
      ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    });

    it("should fail return URI if token was burned", async () => {
      await ERC721Mint.mint(addr1.address);

      const tokenId = await ERC721Mint.tokenId();

      await ERC721Mint.mint(addr2.address);

      await ERC721Mint.burn(tokenId);

      await expect(
        ERC721Mint.connect(addr1).tokenURI(tokenId),
      ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    });

    it("should change URI", async () => {
      const newURI = "ExampleNewURI";

      await ERC721Mint._setNewURI(newURI);

      const endingURI = await ERC721Mint.uri();

      expect(newURI).to.equal(endingURI);
    });

    it("should fail change URI if msg.sender is not owner", async () => {
      const newURI = "ExampleNewURI";

      await expect(
        ERC721Mint.connect(addr1)._setNewURI(newURI),
      ).to.be.revertedWith("Ownable: caller is not the owner");
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
