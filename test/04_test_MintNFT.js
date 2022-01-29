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
    [owner, wallet, wallet2, addr1] = await ethers.getSigners();

    const mintingPassInstance = await ethers.getContractFactory("MintingPass");
    mintingPass = await mintingPassInstance.deploy(wallet.address, URI);

    const ERC721MintInstance = await ethers.getContractFactory("ERC721Mint");
    ERC721Mint = await ERC721MintInstance.deploy("LOL","LOL", URI);
  });

    describe("constructor tests", () => {
      it("should faile if wallet does not exist", async () => {
        const MintNFTInstance = await ethers.getContractFactory("MintNFT");
        await expect(
          MintNFTInstance.deploy(constants.ZERO_ADDRESS, ERC721Mint.address, mintingPass.address, receiver),
        ).to.be.revertedWith("MintNFT::constructor: address is null");
      });
      it("should faile if erc721 does not exist", async () => {
        const MintNFTInstance = await ethers.getContractFactory("MintNFT");
        await expect(
          MintNFTInstance.deploy(wallet.address, constants.ZERO_ADDRESS, mintingPass.address, receiver),
        ).to.be.revertedWith("MintNFT::constructor: address is null");
      });
      it("should faile if minting pass does not exist", async () => {
        const MintNFTInstance = await ethers.getContractFactory("MintNFT");
        await expect(
          MintNFTInstance.deploy(wallet.address, ERC721Mint.address, constants.ZERO_ADDRESS, receiver),
        ).to.be.revertedWith("MintNFT::constructor: address is null");
      });
      it("check values", async () => {
        const MintNFTInstance = await ethers.getContractFactory("MintNFT");
        MintNFT = await MintNFTInstance.deploy(wallet.address, ERC721Mint.address, mintingPass.address, receiver);

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
        MintNFT = await MintNFTInstance.deploy(wallet.address, ERC721Mint.address, mintingPass.address, receiver);
      });
      it("should faile if contract is paused", async () => {
        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256)"](1, { value: ethers.utils.parseEther("6") }),
        ).to.be.revertedWith("MintNFT::buyToken: sales are closed");
      });
      it("should faile if contract is paused", async () => {
        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](1, 2, { value: ethers.utils.parseEther("6") }),
        ).to.be.revertedWith("MintNFT::buyToken: sales are closed");
      });

      it("should faile if not enough ether sent without pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._setSellingMode(true);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1") }),
        ).to.be.revertedWith("MintNFT::buyToken: not enough ether sent");
      });
      
      it("should faile if not enough ether sent with pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._setSellingMode(true);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 1, { value: ethers.utils.parseEther("1") }),
        ).to.be.revertedWith("MintNFT::buyToken: not enough ether sent");
      }); 

      it("should faile if not enough enough supply with pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setAllSaleAmount(10);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._setSellingMode(true);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 1, { value: ethers.utils.parseEther("1") }),
        ).to.be.revertedWith('MintNFT::buyToken: tokens are enough');
      });

      it("should faile if not enough enough supply without pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setAllSaleAmount(10);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._setSellingMode(true);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1") }),
        ).to.be.revertedWith('MintNFT::buyToken: tokens are enough');
      });

      it("should faile if amount exceed allowed without pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._addWhitelist(addr1.address,10);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256)"](15, { value: ethers.utils.parseEther("1.5") }),
        ).to.be.revertedWith('MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist');
      });

      it("should faile if amount exceed allowed with pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._addWhitelist(addr1.address,10);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 0, { value: ethers.utils.parseEther("1.35") }),
        ).to.be.revertedWith('MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist');
      });

      it("should faile if sender has already participated in sales without pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._addWhitelist(addr1.address,10);
        await ERC721Mint.connect(owner)._setMinter(MintNFT.address);

        await MintNFT.connect(addr1).functions["buyToken(uint256)"](1, { value: ethers.utils.parseEther("0.1") });
        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256)"](9, { value: ethers.utils.parseEther("0.9") }),
        ).to.be.revertedWith('MintNFT::buyToken: sender has already participated in sales');
      });

      it("should faile if sender has already participated in sales with pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._addWhitelist(addr1.address,10);

        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 0, { value: ethers.utils.parseEther("1.35") }),
        ).to.be.revertedWith('MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist');
      });

      it("should faile if amount exceed allowed with pass", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);
        await MintNFT.connect(owner)._addWhitelist(addr1.address,10);
        await mintingPass.connect(owner)._setPause(false);
        await mintingPass.connect(addr1).mint(1, 1 , { value: ethers.utils.parseEther("0.06") });
        await mintingPass.connect(addr1).setApprovalForAll(MintNFT.address,1);
        await expect(
          MintNFT.connect(addr1).functions["buyToken(uint256,uint256)"](15, 1, { value: ethers.utils.parseEther("1.35") }),
        ).to.be.revertedWith('MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist');
      });


      it("should turn unpause", async () => {
        await MintNFT.connect(owner)._setManager(owner.address);
        await MintNFT.connect(owner)._setPause(false);

        const isPaused = await MintNFT.isPaused();

        expect(false).to.equal(isPaused);
      });

      it("should change wallet", async () => {
        await MintNFT.connect(owner)._setWallet(wallet2.address);

        const endingWallet = await MintNFT.wallet();

        expect(endingWallet).to.equal(wallet2.address);
      });
    });
});
