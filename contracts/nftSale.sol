// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/Mock/ERC721Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NftSale is Ownable {
    ERC721Mint public token;
    address payable public wallet;
    uint public maxBuyAmount = 10;
    uint public totalSellAmount = 100;
    uint public price = 0.01 ether;
    uint public sendedTokens = 0;
    bytes32 public merkleRoot;

    mapping(address => Amounts) public Accounts;

    struct Amounts {
        uint allowedAmount;
        uint buyedAmount;
        bool claimed;
    }

    bool public preSale = false;
    bool public sale = false;

    event Transfer(address _addr, uint _tokenId);

    constructor(address payable _wallet, address _token) {
        token = ERC721Mint(_token);
        wallet = _wallet;
    }

    function buyToken(uint amount) external payable returns (bool) {
        require(preSale || sale, "NftSale::buyToken: sales are closed");

        uint idToken;

        if (preSale == true) {
            require(Accounts[msg.sender].allowedAmount >= Accounts[msg.sender].buyedAmount + amount, "NftSale::buyToken: you are not logged into whitelist");
            require(msg.value == price * amount, "NftSale::buyToken: sended ether is must equal to price * amount");
            require(sendedTokens + amount <= totalSellAmount, "NftSale::buyToken: amount of sended tokens can not exceed totalSellAmount");

            wallet.transfer(msg.value);
        
            for(uint i = 0; i < amount; i++) {
                idToken = token.mint(msg.sender);
                sendedTokens++;
                Accounts[msg.sender].buyedAmount++;
                emit Transfer(msg.sender, idToken);
            }
            return true;
        }
        if (sale == true) {
            require(amount <= maxBuyAmount, "NftSale::buyToken: amount can not exceed maxBuyAmount");
            require(msg.value == price * amount, "NftSale::buyToken: sended ether is must equal to price * amount");
            require(sendedTokens + amount <= totalSellAmount, "NftSale::buyToken: amount of sended tokens can not exceed totalSellAmount");

            wallet.transfer(msg.value);
        
            for(uint i = 0; i < amount; i++) {
                idToken = token.mint(msg.sender);
                sendedTokens++;
                emit Transfer(msg.sender, idToken);
            }
            return true;
        }
    }

    function setPreSaleMode() external onlyOwner returns (bool) {
        preSale = true;
        sale = false;
        return true;
    }
    function setPreSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = true;
        return true;
    }
    function setNonSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = false;
        return true;
    }


    function whitelistAdd(bytes32[] calldata _merkleProof, uint amount) public returns (bool) {
        require(!Accounts[msg.sender].claimed, "NftSale::whitelistMint: address has already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(_merkleProof, root, leaf), "NftSale::whitelistMint: Invalid proof");

        Accounts[msg.sender].allowedAmount = amount;
        Accounts[msg.sender].claimed = true;
        
        return true;
    }

    function setPrice(uint _price) external onlyOwner returns (bool) { 
        price = _price;
        
        return true;
    }

     function setTotalSellAmount(uint _totalSellAmount) external onlyOwner returns (bool) { 
        totalSellAmount = _totalSellAmount;
        
        return true;
    }

     function setMaxBuyAmount(uint _maxBuyAmount) external onlyOwner returns (bool) { 
        maxBuyAmount = _maxBuyAmount;
        
        return true;
    }

     function setWallet(address payable _wallet) external onlyOwner returns (bool) { 
        wallet = _wallet;
        
        return true;
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner returns (bool) {
        merkleRoot = _merkleRoot;
        
        return true;
    }
}