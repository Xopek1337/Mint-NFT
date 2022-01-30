// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import './ERC721Mint.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

contract MintNFT is Ownable {
    ERC721Mint public token;
    IERC1155 public mintingPass;

    address payable public receiver;
    address payable public wallet;

    uint public allSaleAmount = 10000;
    uint public saleAmount = 0;
    uint public maxPublicSaleAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;

    mapping(address => userData) public Accounts;
    mapping(uint => uint) public amountsFromId;
    mapping(address => bool) public managers;

    struct userData {
        uint allowedAmount;
        uint publicBought;
        bool isBought;
    }

    bool public isPaused = true;
    bool public isPublicSale = false;

    event Buy(address _addr, uint _tokenId);

    constructor(address payable _wallet, address _token, address _mintingPass, address payable _receiver) {
        require(
            _wallet != address(0) &&
            _token != address(0) &&
            _mintingPass != address(0),
            'MintNFT::constructor: address is null'
        );
        token = ERC721Mint(_token);
        mintingPass = IERC1155(_mintingPass);
        wallet = _wallet;
        receiver = _receiver;
        _addManager(msg.sender);

        amountsFromId[0] = 3;
        amountsFromId[1] = 6;
        amountsFromId[2] = 9;
        amountsFromId[3] = 15;
        amountsFromId[4] = 30;
        amountsFromId[5] = 90;
    }
    modifier onlyManager() {
        require(managers[msg.sender], "Ownable: caller is not the manager");
        _;
    }

    function buyToken(uint256 _amount)
        external
        payable
        returns (bool) 
    {
        require(saleAmount + _amount <= allSaleAmount, 'MintNFT::buyToken: tokens are enough');
        require(!isPaused, 'MintNFT::buyToken: sales are closed');
        require(
            msg.value == price * _amount,
            'MintNFT::buyToken: not enough ether sent'
        );

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

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }   

            Accounts[msg.sender].isBought = true;
        } else {
            require(
                Accounts[msg.sender].publicBought + _amount <= maxPublicSaleAmount,
                'MintNFT::buyToken: amount is more than allowed'
            );

            wallet.transfer(msg.value);

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                Accounts[msg.sender].publicBought++;
                emit Buy(msg.sender, tokenId);
            }
        }
        return true;
    }

    function buyToken(uint256 _amount, uint idPass)
        external
        payable
        returns (bool)
    {
        require(saleAmount + _amount <= allSaleAmount, 'MintNFT::buyToken: tokens are enough');
        require(!isPaused, 'MintNFT::buyToken: sales are closed');
        require(
            msg.value == discountPrice * _amount,
            'MintNFT::buyToken: not enough ether sent'
        );
        uint tokenId;

        if (!isPublicSale) {
            if(Accounts[msg.sender].isBought) {
                require(
                    amountsFromId[idPass] >= _amount,
                    'MintNFT::buyToken: amount is more than allowed in private sale'
                );
            }
            else {
                require(
                    (Accounts[msg.sender].allowedAmount + amountsFromId[idPass] >= _amount),
                    'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
                );
            }

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, receiver, idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                emit Buy(msg.sender, tokenId);
            }   

            Accounts[msg.sender].isBought = true;
        } else {
            require(
                (Accounts[msg.sender].publicBought + _amount) <= (maxPublicSaleAmount + amountsFromId[idPass]),
                'MintNFT::buyToken: amount is more than allowed'
            );

            wallet.transfer(msg.value);

            mintingPass.safeTransferFrom(msg.sender, receiver, idPass, 1, '');

            for(uint i = 0; i < _amount; i++) {
                tokenId = token.mint(msg.sender);
                saleAmount++;
                Accounts[msg.sender].publicBought++;
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
        onlyManager
        returns (bool)
    {
        isPaused = _isPaused;

        return true;
    }

    function _addWhitelist(address[] memory users, uint[] memory _amounts) 
        external 
        onlyOwner 
        returns (bool) 
    {
        require(users.length == _amounts.length, 
        'MintNFT::_addWhitelist: amounts length must be equal rates length');
        
        for(uint i = 0; i < users.length; i++) {
            Accounts[users[i]].allowedAmount = _amounts[i];
        }
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

    function addManager(address _manager)
        external
        onlyOwner
        returns(bool)
    {
        _addManager(_manager);

        return true;
    }

    function _addManager(address _manager)
        internal
        onlyOwner
        returns(bool)
    {
        require(!managers[_manager], 'MintNFT::_addManager: is already a manager');

        managers[_manager] = true;

        return true;
    }

    function _removeManager(address _manager)
        external
        onlyOwner
        returns(bool)
    {
        require(managers[_manager], 'MintNFT::_removeManager: is not a manager');

        managers[_manager] = false;

        return true;
    }

    function _withdrawERC20(address _tokenContract, address _recepient)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC20 token = IERC20(_tokenContract);
        token.transfer(_recepient, token.balanceOf(address(this)));

        return true;
    }

    function _withdrawERC721(address _tokenContract, address _recepient, uint _tokenId)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC721 token = IERC721(_tokenContract);
        token.transferFrom(address(this), _recepient, _tokenId);

        return true;
    }
}