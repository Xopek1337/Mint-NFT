// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import './ERC721Mint.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract SaleToken is Ownable, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    ERC721Mint public token;
    IERC1155 public mintingPass;

    address payable public wallet;

    uint public allSaleTokenAmount = 10000;
    uint public saleAmount = 0;
    uint public masPublicSaleAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;

    bytes32 public merkleRoot;

    mapping(address => userData) public Accounts;
    mapping(uint => uint) public amountsFromId;

    struct userData {
        uint allowedAmount;
        uint bought;
        bool isBought;
    }

    bool public isPaused = true;
    bool public isPublicSale = false;

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
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        token = ERC721Mint(_token);
        mintingPass = IERC1155(_mintingPass);
        wallet = _wallet;

        amountsFromId[0] = 3;
        amountsFromId[1] = 6;
        amountsFromId[2] = 9;
        amountsFromId[3] = 15;
        amountsFromId[4] = 30;
        amountsFromId[5] = 90;
    }

    function sale(uint256 _amount)
        external
        payable
        returns (bool)
    {
        require(saleAmount + _amount <= allSaleTokenAmount, 'SaleToken::sale: tokens are enough');

        uint tokenId;

        if (!isPublicSale && !isPaused) {
            require(
                Accounts[msg.sender].allowedAmount >= _amount,
                'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isBought,
                'SaleToken::sale: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   

            Accounts[msg.sender].isBought = true;

            emit Transfer(msg.sender, tokenId, _amount);

            return true;
        } 
        else if (isPublicSale && !isPaused) {
            require(
                Accounts[msg.sender].allowedAmount >= _amount,
                'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isBought,
                'SaleToken::sale: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
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
        require(saleAmount + _amount <= allSaleTokenAmount, 'SaleToken::sale: tokens are enough');

        uint tokenId;

        if (!isPublicSale && !isPaused) {
            if(Accounts[msg.sender].isBought) {
                require(
                    amountsFromId[idPass] >= _amount,
                    'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
                );
            }
            else {
                require(
                    Accounts[msg.sender].allowedAmount + amountsFromId[idPass] >= _amount,
                    'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
                );
            }

            require(
                msg.value == discountPrice * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   

            Accounts[msg.sender].isBought = true;

            return true;
        }

        else if (isPublicSale && !isPaused) {
            require(
                Accounts[msg.sender].bought + _amount >= masPublicSaleAmount + amountsFromId[idPass],
                'SaleToken::sale: amount is more than allowed'
            );
            require(
                msg.value == discountPrice * _amount,
                'SaleToken::sale: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Transfer(msg.sender, tokenId, _amount);
            }   
        }
        else {
            revert('SaleToken::sale: sales are closed');
        }
    }

    function _setSellingMode(bool _isPublicSale)
        external
        onlyOwner
        returns (bool)
    {
        isPublicSale = _isPublicSale;

        return true;
    }

    function _setPause(bool _isPaused)
        external
        onlyRole(MANAGER_ROLE)
        returns (bool)
    {
        isPaused = _isPaused;

        return true;
    }

    function whitelistAdd(address user, uint amount) 
        external 
        onlyOwner 
        returns (bool) 
    {
        Accounts[user].allowedAmount = amount;

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

    function _setMaxTokenAmount(uint _amount) 
        external 
        onlyOwner 
        returns(bool) 
    {
        allSaleTokenAmount = _amount;

        return true;
    }

    function _setManager(address manager) public onlyRole(DEFAULT_ADMIN_ROLE){
        grantRole(MANAGER_ROLE, manager);
    }

    function _withdrawERC20(IERC20 tokenContract, address recepient) 
        external 
        onlyOwner 
        returns(bool)
    {
        tokenContract.transfer(recepient, tokenContract.balanceOf(address(this)));

        return true;
    }

    function _withdrawERC721(IERC721 tokenContract, address recepient) 
        external 
        onlyOwner 
        returns(bool) 
    {
        tokenContract.transferFrom(address(this), recepient, tokenContract.balanceOf(address(this)));

        return true;
    }
}