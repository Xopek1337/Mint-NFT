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
    bytes32 public root;

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

    function buyToken(uint amount) external payable {
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
        }
    }

    function changeMode(string memory _command) external onlyOwner {
        if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("presaleMode"))) {
            preSale = true;
            sale = false;
            return;
        }
        else if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("saleMode"))) {
            preSale = false;
            sale = true;
            return;
        }
        else if (keccak256(abi.encodePacked(_command)) == keccak256(abi.encodePacked("nonSale"))) {
            preSale = false;
            sale = false;
            return;
        }
        else {
            revert("Invalid command");
        }
    }

    function whitelistMint(bytes32[] calldata _merkleProof, uint amount) public
    {
        require(Accounts[msg.sender].claimed, "NftSale::whitelistMint: address has already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(_merkleProof, root, leaf), "NftSale::whitelistMint: Invalid proof");

        Accounts[msg.sender].allowedAmount = amount;
        Accounts[msg.sender].claimed = true;
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

    function setRoot(bytes32 _root) external onlyOwner {
        root = _root;
    }
}