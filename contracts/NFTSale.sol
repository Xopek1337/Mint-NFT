// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/ERC1155Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NFTSale is Ownable {
    uint256[] public supplies = [100];
    uint256[] public minted = [0];
    uint256[] public rates = [0.01 ether];

    ERC1155Mint public token;
    address payable public wallet;
    uint public maxBuyAmount = 10;

    mapping(address => Amounts) public Accounts;

    struct Amounts {
        uint allowedAmount;
        uint buyedAmount;
    }

    bool public preSale = false;
    bool public sale = false;

    event Transfer(address _addr, uint _collectionId, uint _amount);

    constructor(address payable _wallet, address _token) {
        token = ERC1155Mint(_token);
        wallet = _wallet;
    }

    function buyToken(uint collectionId, uint amount) external payable returns (bool) {
        require(preSale || sale, "NFTSale::buyToken: sales are closed");

        if (preSale) {
            require(Accounts[msg.sender].allowedAmount >= Accounts[msg.sender].buyedAmount + amount, "NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
            require(amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(collectionId < supplies.length, "NFTSale::buyToken: collection does not exist");
            require(collectionId >= 0, "NFTSale::buyToken: collection does not exist");
            require(msg.value == rates[collectionId] * amount, "NFTSale::buyToken: not enough ether sent");

            minted[collectionId] += amount;
            require(minted[collectionId] <= supplies[collectionId], "NFTSale::buyToken: not enough supply");

            wallet.transfer(msg.value);
            token.mint(collectionId, amount, msg.sender);
            emit Transfer(msg.sender, collectionId, amount);

            return true;
        }
        if (sale) {
            require(amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(collectionId < supplies.length, "NFTSale::buyToken: collection does not exist");
            require(collectionId >= 0, "NFTSale::buyToken: collection does not exist");
            require(msg.value == rates[collectionId] * amount, "NFTSale::buyToken: not enough ether sent");

            minted[collectionId] += amount;
            require(minted[collectionId] <= supplies[collectionId], "NFTSale::buyToken: not enough supply");
            
            wallet.transfer(msg.value);
            token.mint(collectionId, amount, msg.sender);
            emit Transfer(msg.sender, collectionId, amount);
            
            return true;
        }
    }

    function setPreSaleMode() external onlyOwner returns (bool) {
        preSale = true;
        sale = false;
        return true;
    }
    function setSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = true;
        return true;
    }
    function setNonSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = false;
        return true;
    }

    function whitelistAdd(address account, uint amount) external onlyOwner returns (bool) {
        Accounts[account].allowedAmount = amount;
        
        return true;
    }

    function changeCouponPrice(uint collectionId, uint price) external onlyOwner returns (bool) {
        rates[collectionId] = price;

        return true;
    }

    function changeCouponAmount(uint collectionId, uint amount) external onlyOwner returns (bool) {
        supplies[collectionId] = amount;

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
     function addCoupons(uint[] calldata _supplies, uint[] calldata _rates) external onlyOwner returns (bool) {
        require(_supplies.length == _rates.length, 'NFTSale::addCoupons: amounts length must be equal rates length');
        for(uint i = 0; i < _supplies.length; i++) {
            supplies.push(_supplies[i]);
            rates.push(_rates[i]);
        }
        return true;
    }
}