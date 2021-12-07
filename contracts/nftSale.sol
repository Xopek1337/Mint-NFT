// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/Mock/ERC721Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract nftSale is Ownable {
    ERC721Mint public token;
    address payable public wallet;
    uint public maxBuyAmount = 10;
    uint public totalSellAmount = 100;
    uint public price = 0.01 ether;
    constructor(address payable _wallet, address _token) {
        token = ERC721Mint(_token);
        wallet = _wallet;
    }
    
    function buyToken(uint amount) payable external {
        require(amount <= maxBuyAmount, "amount can not exceed maxBuyAmount");
        require(msg.value == price * amount, "sended ether is must equal to price * amount");

        wallet.transfer(msg.value);
         
        for(uint i = 0; i < amount; i++)
            token.mint(msg.sender);
    }

    function setPrice(uint _price) external onlyOwner { 
        price = _price;
    }

     function setTotalSellAmount(uint _totalSellAmount) external onlyOwner { 
        totalSellAmount = _totalSellAmount;
    }

     function setMaxBuyAmount(uint _maxBuyAmount) external onlyOwner { 
        maxBuyAmount = _maxBuyAmount;
    }

     function setWallet(address payable _wallet) external onlyOwner { 
        wallet = _wallet;
    }
}