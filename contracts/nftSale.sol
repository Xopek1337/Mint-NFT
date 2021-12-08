// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/Mock/ERC721Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftSale is Ownable {
    ERC721Mint public token;
    address payable public wallet;
    uint public maxBuyAmount = 10;
    uint public totalSellAmount = 100;
    uint public price = 0.01 ether;
    uint public sendedTokens = 0;

    mapping(address => Amounts) public Balances;

    struct Amounts {
        uint allowedAmount;
        uint buyedAmount;
    }

    bool preSale = false;
    bool sale = false;

    event Transfer(address _addr, uint _tokenId);

    constructor(address payable _wallet, address _token) {
        token = ERC721Mint(_token);
        wallet = _wallet;
    }

    function buyToken(uint amount) external payable {
        require(preSale != false || sale != false, "NftSale::buyToken: sales are closed");
        if (preSale == true) {
            require(Balances[msg.sender].allowedAmount > Balances[msg.sender].buyedAmount, "NftSale::buyToken: you are not logged into whitelist");
            require(amount <= Balances[msg.sender].allowedAmount, "NftSale::buyToken: amount can not exceed allowedAmount");
            require(msg.value == price * amount, "NftSale::buyToken: sended ether is must equal to price * amount");
            require(sendedTokens + amount <= totalSellAmount, "NftSale::buyToken: amount of sended tokens can not exceed totalSellAmount");

            uint idToken;

            wallet.transfer(msg.value);
        
            for(uint i = 0; i < amount; i++) {
                idToken = token.mint(msg.sender);
                sendedTokens++;
                Balances[msg.sender].buyedAmount++;
                emit Transfer(msg.sender, idToken);
            }
        }
        if (sale == true) {
            require(amount <= maxBuyAmount, "NftSale::buyToken: amount can not exceed maxBuyAmount");
            require(msg.value == price * amount, "NftSale::buyToken: sended ether is must equal to price * amount");
            require(sendedTokens + amount <= totalSellAmount, "NftSale::buyToken: amount of sended tokens can not exceed totalSellAmount");

            uint idToken;

            wallet.transfer(msg.value);
        
            for(uint i = 0; i < amount; i++) {
                idToken = token.mint(msg.sender);
                sendedTokens++;
                emit Transfer(msg.sender, idToken);
            }
        }
    }

    function changeMode(string memory _command) external onlyOwner {
        if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("presaleMode"))) {
            preSale = true;
            sale = false;
            return;
        }
        if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("saleMode"))) {
            preSale = false;
            sale = true;
            return;
        }
        if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("nonSale"))) {
            preSale = false;
            sale = false;
            return;
        }
    }

    function addWhilelist(address _addr, uint amount) external onlyOwner {
        Balances[_addr].allowedAmount = amount;
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

     function setWallet(address payable _wallet) external onlyOwner{ 
        wallet = _wallet;
    }
}