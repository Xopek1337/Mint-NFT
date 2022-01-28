// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import './ERC721Mint.sol';
import './MintingPass.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

contract SaleToken is Ownable {
    ERC721Mint public token;
    MintingPass public mintingPass;
    address payable public wallet;
    uint public maxTokenAmount = 10000;
    uint public boughtAmount = 0;
    uint public maxBuyAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;
    bytes32 public merkleRoot;

    mapping(address => Amounts) public Accounts;

    struct Amounts {
        uint allowed;
        uint bought;
        bool isTakePartInSale;
        bool isClaimed;
    }

    bool public privateSale = false;
    bool public publicSale = false;

    event Transfer(address _addr, uint _tokenId, uint _amount);

    constructor(address payable _wallet, address _token, address _mintingPass) {
        require(
            _wallet != address(0),
            'SaleToken::constructor: wallet does not exist'
        );
        require(
            _token != address(0),
            'SaleToken::constructor: token does not exist'
        );
        require(
            _mintingPass != address(0),
            'SaleToken::constructor: mintingPass does not exist'
        );

        token = ERC721Mint(_token);
        mintingPass = MintingPass(_mintingPass);
        wallet = _wallet;
    }

    function sale(uint256 _amount)
        external
        payable
        returns (bool)
    {
        require(boughtAmount + _amount <= maxTokenAmount, 'SaleToken::sale: tokens are enough');

        uint tokenId;

        if (privateSale) {
            require(
                Accounts[msg.sender].allowed >= _amount,
                'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isTakePartInSale,
                'SaleToken::sale: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++)
            {
                tokenId = token.mint(msg.sender);
                boughtAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   

            Accounts[msg.sender].isTakePartInSale = true;

            emit Transfer(msg.sender, tokenId, _amount);

            return true;
        } 
        else if (publicSale) {
            require(
                Accounts[msg.sender].allowed >= _amount,
                'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isTakePartInSale,
                'SaleToken::sale: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++)
            {
                tokenId = token.mint(msg.sender);
                boughtAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   
        }
        else {
            revert('SaleToken::sale: sales are closed');
        }
    }

    function sale(uint256 _amount, uint idPass)
        external
        payable
        returns (bool)
    {
        require(boughtAmount + _amount <= maxTokenAmount, 'SaleToken::sale: tokens are enough');

        uint tokenId;

        if (privateSale) {
            require(
                Accounts[msg.sender].allowed >= _amount,
                'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isTakePartInSale,
                'SaleToken::sale: sender has already participated in sales'
            );
            require(
                msg.value == discountPrice * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++)
            {
                tokenId = token.mint(msg.sender);
                boughtAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   

            Accounts[msg.sender].isTakePartInSale = true;

            return true;
        }

        else if (publicSale) {
            require(
                Accounts[msg.sender].bought + _amount >= maxBuyAmount,
                'SaleToken::sale: amount is more than allowed'
            );
            require(
                msg.value == discountPrice * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++)
            {
                tokenId = token.mint(msg.sender);
                boughtAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   
        }
        else {
            revert('SaleToken::sale: sales are closed');
        }
    }

    function _setSellingMode(bool _publicSale, bool _privateSale)
        external
        onlyOwner
        returns (bool)
    {
        require(
            (_publicSale && _privateSale) == false,
            'SaleToken::setSellingMode: can not set 2 selling mode at once'
        );

        publicSale = _publicSale;
        privateSale = _privateSale;
    }

    function whitelistAdd(bytes32[] calldata _merkleProof, uint amount) public returns (bool) {
        require(!Accounts[msg.sender].isClaimed, "NftSale::whitelistMint: address has already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "NftSale::whitelistMint: Invalid proof");

        Accounts[msg.sender].allowed = amount;
        Accounts[msg.sender].isClaimed = true;
        
        return true;
    }

    function _setWallet(address payable _wallet)
        external
        onlyOwner
        returns (bool) 
    {
        wallet = _wallet;

        return true;
    }

    function changeMerkleRoot(bytes32 _root) 
    external 
    onlyOwner 
    returns (bool) 
    {
        merkleRoot = _root;

        return true;
    }
}