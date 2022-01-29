// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import './ERC721Mint.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract MintNFT is Ownable, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    ERC721Mint public token;
    IERC1155 public mintingPass;

    address payable public wallet;

    uint public allSaleAmount = 10000;
    uint public saleAmount = 0;
    uint public maxPublicSaleAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;

    mapping(address => userData) public Accounts;
    mapping(uint => uint) public amountsFromId;

    struct userData {
        uint allowedAmount;
        uint publicBought;
        bool isBought;
    }

    bool public isPaused = true;
    bool public isPublicSale = false;

    event Buy(address _addr, uint _tokenId);

    constructor(address payable _wallet, address _token, address _mintingPass) {
        require(
            _wallet != address(0) &&
            _token != address(0) &&
            _mintingPass != address(0),
            'MintNFT::constructor: address is null'
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

    function buyTokens(uint256 _amount)
        external
        payable
        returns (bool) 
    {
        require(saleAmount + _amount <= allSaleAmount, 'SaleToken::sale: tokens are enough');
        require(!isPaused, 'MintNFT::buyToken: sales are closed');

        uint tokenId;

        if (!isPublicSale) {
            require(
                Accounts[msg.sender].allowedAmount >= _amount,
                'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isBought,
                'MintNFT::buyToken: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'MintNFT::buyToken: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }   

            Accounts[msg.sender].isBought = true;
        } else {
            require(
                Accounts[msg.sender].allowedAmount >= _amount,
                'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
            );
            require(
                !Accounts[msg.sender].isBought,
                'MintNFT::buyToken: sender has already participated in sales'
            );
            require(
                msg.value == price * _amount,
                'MintNFT::buyToken: not enough ether sent'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }
        } 
        return true;
    }

    function buyTokens(uint256 _amount, uint idPass)
        external
        payable
        returns (bool)
    {
        require(saleAmount + _amount <= allSaleAmount, 'MintNFT::buyToken: tokens are enough');
        require(!isPaused, 'MintNFT::buyToken: sales are closed');

        uint tokenId;

        if (!isPublicSale) {
            if(Accounts[msg.sender].isBought) {
                require(
                    amountsFromId[idPass] >= _amount,
                    'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
                );
            }
            else {
                require(
                    Accounts[msg.sender].allowedAmount + amountsFromId[idPass] >= _amount,
                    'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
                );
            }

            require(
                msg.value == discountPrice * _amount,
                'MintNFT::buyToken: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }   

            Accounts[msg.sender].isBought = true;
        } else {
            require(
                Accounts[msg.sender].publicBought + _amount >= maxPublicSaleAmount + amountsFromId[idPass],
                'MintNFT::buyToken: amount is more than allowed'
            );
            require(
                msg.value == discountPrice * _amount,
                'MintNFT::buyToken: not enough ether sent'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, address(this), idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }   
        }
        return true;
    }

    function _setPublicSale(bool _isPublicSale)
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

    function _addWhitelist(address user, uint _amount) 
        external 
        onlyOwner 
        returns (bool) 
    {
        Accounts[user].allowedAmount = _amount;

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

    function _setAllSaleAmount(uint _amount) 
        external 
        onlyOwner 
        returns(bool) 
    {
        allSaleAmount = _amount;

        return true;
    }

    function _setManager(address manager) public onlyRole(DEFAULT_ADMIN_ROLE) {
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

    function _withdrawERC721(IERC721 tokenContract, address recepient, uint tokenId) 
        external 
        onlyOwner 
        returns(bool) 
    {
        tokenContract.transferFrom(address(this), recepient, tokenId);

        return true;
    }
}