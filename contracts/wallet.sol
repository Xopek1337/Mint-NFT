pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol"
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    adress public addr;
    IERC721 public token;
    adress public getPayment;
    uint public maxAmount;
    uint public totalSupply;
    uint public price;

    constructor(uint _addr) {
        token = IERC721(addr);
        getPayment = _addr;
        price = 0.01 ether;
        maxAmount = 10;
        totalSupply = 100;
    }
    
    function sellToken(uint amount) external public {
        require(amount < maxAmount);
        require(msg.value == price * amount);
        require(totalSupply >= amount);

        (bool success, ) = getPayment.call{value: msg.value};

        if(success) {
            token.approve(msg.sender, amount);
            token.transferFrom(addr, msg.sender, amount);
        }
    }
    function setPrice(uint _price) onlyOwner {
        price = _price;
    }
    function setTotalSupply(uint _supply) onlyOwner {
        totalSupply = _supply;
    }
    function setMaxAmount(uint _amount) onlyOwner {
        maxAmount = _amount;
    }
    function setPayAdress(adress _getPayment) onlyOwner {
        getPayment = _getPayment;
    }
}