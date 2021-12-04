// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    address public addr;
    IERC721 public token;
    address public getPayment;
    uint public maxAmount;
    uint public totalSupply;
    uint public price;

    constructor(address _addr) {
        token = IERC721(addr);
        getPayment = _addr;
        price = 0.01 ether;
        maxAmount = 10;
        totalSupply = 100;
    }
    
    function sellToken(uint amount) payable external {
        require(amount <= maxAmount);
        require(msg.value == price * amount);
        require(totalSupply >= amount);

        (bool success,) = getPayment.call{value: msg.value}("");

        if(success) {
            token.approve(msg.sender, amount);
            token.transferFrom(addr, msg.sender, amount);
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