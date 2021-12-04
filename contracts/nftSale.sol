// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract nftSale is Ownable {
    ERC721 public token;
    address public addr;
    address public getPayment;
    uint public maxAmount = 10;
    uint public totalSupply = 100;
    uint public price = 0.01 ether;

    constructor(address wallet, address _token) {
        addr = _token;
        token = ERC721(_token);
        getPayment = wallet;
    }
    
    function buyToken(uint amount) payable external {
        require(amount <= maxAmount && totalSupply >= amount);
        require(msg.value == price * amount);

        (bool success,) = getPayment.call{value: msg.value}("");

        if(success) {
            token.mint(msg.sender, amount);
        }
    }
    function setPrice(uint _price) external onlyOwner {
        price = _price;
    }
    function setTotalSupply(uint _supply) external onlyOwner {
        totalSupply = _supply;
    }
    function setMaxAmount(uint _amount) external onlyOwner {
        maxAmount = _amount;
    }
    function setPayAddress(address _getPayment) external onlyOwner {
        getPayment = _getPayment;
    }
}