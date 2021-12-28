// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/ERC1155Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NFTSale is Ownable {
    struct TokenData {
        uint amount;
        uint minted;
        uint rate;
    }

    TokenData[] public tokens;

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

        addToken(100, 0.01 ether);
    }

    function buyToken(uint bundle, uint amount) external payable returns (bool) {
        if (preSale) {
            require(Accounts[msg.sender].allowedAmount >= Accounts[msg.sender].buyedAmount + amount, "NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
            require(amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(bundle < tokens.length, "NFTSale::buyToken: collection does not exist");
            require(msg.value == tokens[bundle].rate * amount, "NFTSale::buyToken: not enough ether sent");

            tokens[bundle].minted += amount;
            require(tokens[bundle].minted <= tokens[bundle].amount, "NFTSale::buyToken: not enough supply");

            wallet.transfer(msg.value);
            token.mint(bundle, amount, msg.sender);
            emit Transfer(msg.sender, bundle, amount);

            return true;
        }
        else if (sale) {
            require(amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(bundle < tokens.length, "NFTSale::buyToken: collection does not exist");
            require(msg.value == tokens[bundle].rate * amount, "NFTSale::buyToken: not enough ether sent");

            tokens[bundle].minted += amount;
            require(tokens[bundle].minted <= tokens[bundle].amount, "NFTSale::buyToken: not enough supply");
            
            wallet.transfer(msg.value);
            token.mint(bundle, amount, msg.sender);
            emit Transfer(msg.sender, bundle, amount);
            
            return true;
        }
        else {
            revert("NFTSale::buyToken: sales are closed");
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

    function setMaxBuyAmount(uint _maxBuyAmount) external onlyOwner returns (bool) { 
        maxBuyAmount = _maxBuyAmount;
        
        return true;
    }

    function setWallet(address payable _wallet) external onlyOwner returns (bool) { 
        wallet = _wallet;
        
        return true;
    }
    function _setTokenData(uint couponId, uint amount, uint rate) external onlyOwner returns (bool) {
        tokens[couponId].amount = amount;
        tokens[couponId].rate = rate;

        return true;
    }

    function _addTokens(uint[] calldata amounts, uint[] calldata rates) public onlyOwner returns (bool) {
        require(amounts.length == rates.length, 'NFTSale::addTokens: amounts length must be equal rates length');

        for(uint i = 0; i < amounts.length; i++) {
            addToken(amounts[i], rates[i]);
        }

        return true;
    }

    function addToken(uint amount, uint rate) internal returns (bool) {
        TokenData memory pass = TokenData({amount: amount, minted: 0, rate: rate});
        tokens.push(pass);

        return true;
    }

    function getTokens() public view returns (TokenData[] memory) {
        return tokens;
    }

    function getTokensLength() public view returns (uint) {
        return tokens.length;
    }
}