const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ethers: {
    BigNumber,
  },
} = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");

const URI = process.env.NFT_URI;
const receiver = process.env.RECEIVER;

describe("MintNFT test", () => {
  let mintingPass;
  let ERC721Mint;
  let MintNFT;

  beforeEach(async () => {
    [owner, wallet, wallet2, addr1, addr2] = await ethers.getSigners();

    const mintingPassInstance = await ethers.getContractFactory("MintingPass");
    mintingPass = await mintingPassInstance.deploy(wallet.address, URI);

    const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
    ERC721Mint = await ERC721MintInstance.deploy("LOL", "LOL", URI);

    const ERC20TestInstance = await ethers.getContractFactory("ERC20Test");
    const ERC721TestInstance = await ethers.getContractFactory("ERC721Test");

    ERC20Test = await ERC20TestInstance.deploy("ERC20Test", "Test");
    ERC721Test = await ERC721TestInstance.deploy("ERC721Test", "Test");
  });

  describe("constructor tests", () => {
    it("should faile if wallet does not exist", async () => {
      const MintNFTInstance = await ethers.getContractFactory("MintNFT");
      await expect(
        MintNFTInstance.deploy(
          constants.ZERO_ADDRESS,
          ERC721Mint.address,
          mintingPass.address,
          receiver,
        ),
      ).to.be.revertedWith("MintNFT::constructor: address is null");
    });
    it("should faile if erc721 does not exist", async () => {
      const MintNFTInstance = await ethers.getContractFactory("MintNFT");
      await expect(
        MintNFTInstance.deploy(
          wallet.address,
          constants.ZERO_ADDRESS,
          mintingPass.address,
          receiver,
        ),
      ).to.be.revertedWith("MintNFT::constructor: address is null");
    });
    it("should faile if minting pass does not exist", async () => {
      const MintNFTInstance = await ethers.getContractFactory("MintNFT");
      await expect(
        MintNFTInstance.deploy(
          wallet.address,
          ERC721Mint.address,
          constants.ZERO_ADDRESS,
          receiver,
        ),
      ).to.be.revertedWith("MintNFT::constructor: address is null");
    });
    it("check values", async () => {
      const MintNFTInstance = await ethers.getContractFactory("MintNFT");
      MintNFT = await MintNFTInstance.deploy(
        wallet.address,
        ERC721Mint.address,
        mintingPass.address,
        receiver,
      );

      const [walletAddress, tokenAddress, passAddress, receiverAddress] = await Promise.all([
        MintNFT.wallet(),
        MintNFT.token(),
        MintNFT.mintingPass(),
        MintNFT.receiver(),
      ]);
      expect(walletAddress).to.be.equal(wallet.address);
      expect(tokenAddress).to.be.equal(ERC721Mint.address);
      expect(passAddress).to.be.equal(mintingPass.address);
      expect(receiverAddress).to.be.equal(receiver);
    });
  });

  describe("Other tests", () => {
    beforeEach(async () => {
      const MintNFTInstance = await ethers.getContractFactory("MintNFT");
      MintNFT = await MintNFTInstance.deploy(
        wallet.address,
        ERC721Mint.address,
        mintingPass.address,
        receiver,
      );
    });
    it("should faile if contract is paused without pass", async () => {
      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](1, { value: ethers.utils.parseEther("6") }),
      ).to.be.revertedWith("MintNFT::buyToken: sales are closed");
    });
    it("should faile if contract is paused with pass", async () => {
      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](1, 2, { value: ethers.utils.parseEther("6") }),
      ).to.be.revertedWith("MintNFT::buyToken: sales are closed");
    });

    it("should faile if not enough ether sent without pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._setPublicSale(true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1") }),
      ).to.be.revertedWith("MintNFT::buyToken: not enough ether sent");
    });

    it("should faile if not enough ether sent with pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._setPublicSale(true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 1, { value: ethers.utils.parseEther("1") }),
      ).to.be.revertedWith("MintNFT::buyToken: not enough ether sent");
    });

    it("should faile if not enough enough supply with pass", async () => {
      await MintNFT.connect(owner)._setAllSaleAmount(10);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._setPublicSale(true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 1, { value: ethers.utils.parseEther("1") }),
      ).to.be.revertedWith("MintNFT::buyToken: tokens are enough");
    });

    it("should faile if not enough enough supply without pass", async () => {
      await MintNFT.connect(owner)._setAllSaleAmount(10);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._setPublicSale(true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1") }),
      ).to.be.revertedWith("MintNFT::buyToken: tokens are enough");
    });

    it("should faile if amount exceed allowed without pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1.5") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should faile if amount exceed allowed with pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 0, { value: ethers.utils.parseEther("1.35") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should faile if sender has already participated in sales without pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);
      await ERC721Mint.connect(owner)._addManager(MintNFT.address);

      await MintNFT.connect(addr1).functions["buyToken(uint256)"](1, { value: ethers.utils.parseEther("0.1") });
      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](9, { value: ethers.utils.parseEther("0.9") }),
      ).to.be.revertedWith("MintNFT::buyToken: sender has already participated in sales");
    });

    it("should faile if sender has already participated in sales with pass", async () => {
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 0, { value: ethers.utils.parseEther("1.35") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist");
    });

    it("should transfer without pass in private sale", async () => {
      const price = await BigNumber.from("1000000000000000000");
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);
      await MintNFT._setPublicSale(false);

      const startingBalance = await ethers.provider.getBalance(wallet.address);

      await MintNFT.connect(addr1).functions["buyToken(uint256)"](10, { value: ethers.utils.parseEther("1") });

      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingBalance).to.equal(endingBalance.sub(price));
    });

    it("should transfer without pass in public sale", async () => {
      const price = await BigNumber.from("300000000000000000");
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT._setPublicSale(true);

      const startingBalance = await ethers.provider.getBalance(wallet.address);

      await MintNFT.connect(addr1).functions["buyToken(uint256)"](3, { value: ethers.utils.parseEther("0.3") });

      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingBalance).to.equal(endingBalance.sub(price));
    });

    it("should faile if amount is more than allowed without pass in public sale", async () => {
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT._setPublicSale(true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256)"](9, { value: ethers.utils.parseEther("0.9") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed");
    });

    it("should transfer with pass in private sale", async () => {
      const tokenPrice = await BigNumber.from("900000000000000000");
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);
      await mintingPass._setPause(false);
      await mintingPass.connect(addr1).mint(0, 1, { value: ethers.utils.parseEther("0.03") });
      await mintingPass.connect(addr1).setApprovalForAll(MintNFT.address, true);

      const startingBalance = await ethers.provider.getBalance(wallet.address);
      const startingPassBalance = await mintingPass.balanceOf(receiver, 0);

      await MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](10, 0, { value: ethers.utils.parseEther("0.9") });

      const endingPassBalance = await mintingPass.balanceOf(receiver, 0);
      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingPassBalance).to.equal(endingPassBalance.sub(1));
      expect(startingBalance).to.equal(endingBalance.sub(tokenPrice));
    });

    it("should transfer with pass in public sale", async () => {
      const tokenPrice = await BigNumber.from("540000000000000000");
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [10]);
      await MintNFT._setPublicSale(true);
      await mintingPass._setPause(false);
      await mintingPass.connect(addr1).mint(0, 1, { value: ethers.utils.parseEther("0.03") });
      await mintingPass.connect(addr1).setApprovalForAll(MintNFT.address, true);

      const startingBalance = await ethers.provider.getBalance(wallet.address);
      const startingPassBalance = await mintingPass.balanceOf(receiver, 0);

      await MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](6, 0, { value: ethers.utils.parseEther("0.54") });

      const endingPassBalance = await mintingPass.balanceOf(receiver, 0);
      const endingBalance = await ethers.provider.getBalance(wallet.address);

      expect(startingPassBalance).to.equal(endingPassBalance.sub(1));
      expect(startingBalance).to.equal(endingBalance.sub(tokenPrice));
    });

    it("should faile if amount exceed allowed with pass in private sale", async () => {
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [5]);
      await mintingPass._setPause(false);
      await mintingPass.connect(addr1).mint(0, 2, { value: ethers.utils.parseEther("0.06") });
      await mintingPass.connect(addr1).setApprovalForAll(MintNFT.address, true);

      await MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](1, 0, { value: ethers.utils.parseEther("0.09") });

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](4, 0, { value: ethers.utils.parseEther("0.36") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed in private sale");
    });

    it("should faile if amount is more than allowed with pass in public sale", async () => {
      await ERC721Mint._addManager(MintNFT.address);
      await MintNFT.connect(owner)._setPause(false);
      await MintNFT.connect(owner)._addWhitelist([addr1.address], [5]);
      await MintNFT._setPublicSale(true);
      await mintingPass._setPause(false);
      await mintingPass.connect(addr1).mint(0, 1, { value: ethers.utils.parseEther("0.03") });
      await mintingPass.connect(addr1).setApprovalForAll(MintNFT.address, true);

      await expect(
        MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](10, 0, { value: ethers.utils.parseEther("0.9") }),
      ).to.be.revertedWith("MintNFT::buyToken: amount is more than allowed");
    });

    it("should turn unpause", async () => {
      await MintNFT.connect(owner)._setPause(false);

      const isPaused = await MintNFT.isPaused();

      expect(false).to.equal(isPaused);
    });

    it("should fail unpause if msg.sender is not manager", async () => {
      await expect(
        MintNFT.connect(addr1)._setPause(false),
      ).to.be.revertedWith("Ownable: caller is not the manager");
    });

    it("should change wallet", async () => {
      await MintNFT.connect(owner)._setWallet(wallet2.address);

      const endingWallet = await MintNFT.wallet();

      expect(endingWallet).to.equal(wallet2.address);
    });

    it("should add manager", async () => {
      await MintNFT.addManager(addr1.address);

      const isManager = await MintNFT.managers(addr1.address);

      expect(isManager).to.equal(true);
    });

    it("should fail add manager if address is already a manager", async () => {
      await MintNFT.addManager(addr2.address);

      await expect(
        MintNFT.addManager(addr2.address),
      ).to.be.revertedWith("MintNFT::_addManager: is already a manager");
    });

    it("should fail remove manager if address is not a manager", async () => {
      await expect(
        MintNFT._removeManager(addr2.address),
      ).to.be.revertedWith("MintNFT::_removeManager: is not a manager");
    });

    it("should remove manager", async () => {
      await MintNFT.addManager(addr1.address);
      await MintNFT._removeManager(addr1.address);

      const isManager = await MintNFT.managers(addr2.address);

      expect(isManager).to.equal(false);
    });

    it("should withdraw erc20 tokens", async () => {
      const amount = 100;

      await ERC20Test.transfer(addr1.address, amount);

      const startingBalance = await ERC20Test.balanceOf(addr1.address);

      await ERC20Test.connect(addr1).transfer(MintNFT.address, amount);
      await MintNFT._withdrawERC20(ERC20Test.address, addr1.address);

      const endingBalance = await ERC20Test.balanceOf(addr1.address);

      expect(startingBalance).to.equal(endingBalance);
    });

    it("should fail withdraw erc20 tokens if msg.sender is not owner", async () => {
      await expect(
        MintNFT.connect(addr1)._withdrawERC20(ERC20Test.address, addr1.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should withdraw erc721 tokens", async () => {
      const tokenId = 5;

      await ERC721Test.transferFrom(owner.address, addr1.address, tokenId);

      const startingBalance = await ERC721Test.balanceOf(addr1.address);

      await ERC721Test.connect(addr1).transferFrom(addr1.address, MintNFT.address, tokenId);
      await MintNFT._withdrawERC721(ERC721Test.address, addr1.address, tokenId);

      const endingBalance = await ERC721Test.balanceOf(addr1.address);

      expect(startingBalance).to.equal(endingBalance);
    });

    it("should fail withdraw erc721 tokens if msg.sender is not owner", async () => {
      const tokenId = 5;

      await expect(
        MintNFT.connect(addr1)._withdrawERC721(ERC721Test.address, addr1.address, tokenId),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should add to whilelist", async () => {
      await MintNFT._addWhitelist([addr1.address], [10]);
      const data = await MintNFT.Accounts(addr1.address);

      expect(data.allowedAmount).to.equal(10);
    });

    it("should faile if amounts length must not be equal rates length", async () => {
      const amounts = [320, 300, 280, 260];
      const addresses = [addr1.address, addr2.address];

      await expect(
        MintNFT._addWhitelist(addresses, amounts),
      ).to.be.revertedWith("MintNFT::_addWhitelist: amounts length must be equal rates length");
    });

    it("should set all Sale amount", async () => {
      await MintNFT._setAllSaleAmount(10);
      const data = await MintNFT.allSaleAmount();

      expect(data).to.equal(10);
    });
  });
});
