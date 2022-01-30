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

    address public receiver;
    address payable public wallet;

    uint public allSaleAmount = 10000;
    uint public saleCounter = 0;
    uint public maxPublicSaleAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;

    struct userData {
        uint allowedAmount;
        uint publicBought;
    }

    mapping(address => userData) public Accounts;
    mapping(uint => uint) public amountsFromId;
    mapping(address => bool) public managers;

    bool public isPaused = true;
    bool public isPublicSale = false;

    event Mint(address indexed user, uint tokenAmount);

    modifier onlyManager() {
        require(managers[msg.sender], "Ownable: caller is not the manager");
        _;
    }

    constructor(address _token, address _mintingPass, address payable _wallet, address _receiver) {
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
        _updateManagerList(msg.sender, true);

        amountsFromId[0] = 3;
        amountsFromId[1] = 6;
        amountsFromId[2] = 9;
        amountsFromId[3] = 15;
        amountsFromId[4] = 30;
        amountsFromId[5] = 90;
    }

    function mint(uint256 _tokenAmount)
        external
        payable
        returns (bool)
    {
        return mintInternal(_tokenAmount, false, 0);
    }

    function mint(uint256 _tokenAmount, uint mintingPassId)
        external
        payable
        returns (bool)
    {
        return mintInternal(_tokenAmount, true, mintingPassId);
    }

    function mintInternal(uint _tokenAmount, bool useMintingPass, uint mintingPassId) internal returns (bool) {
        require(saleCounter + _tokenAmount <= allSaleAmount, 'MintNFT::buyToken: tokens are enough');
        require(!isPaused, 'MintNFT::buyToken: sales are closed');

        uint sum;

        if (useMintingPass) {
            sum = discountPrice * _tokenAmount;

            mintingPass.safeTransferFrom(msg.sender, receiver, mintingPassId, 1, '');

            require(
                _tokenAmount <= amountsFromId[mintingPassId],
                'MintNFT::buyToken: amount is more than allowed'
            );
        } else {
            sum = price * _tokenAmount;

            if (isPublicSale) {
                require(
                    Accounts[msg.sender].publicBought + _tokenAmount <= maxPublicSaleAmount,
                    'MintNFT::buyToken: amount is more than allowed'
                );

                Accounts[msg.sender].publicBought += _tokenAmount;
            } else {
                require(
                    Accounts[msg.sender].allowedAmount >= _tokenAmount,
                    'MintNFT::buyToken: amount is more than allowed or you are not logged into whitelist'
                );

                Accounts[msg.sender].allowedAmount = 0;
            }
        }

        require(
            msg.value == sum,
            'MintNFT::buyToken: not enough ether sent'
        );

        wallet.transfer(msg.value);

        for(uint i = 0; i < _tokenAmount; i++) {
            token.mint(msg.sender);
        }

        saleCounter += _tokenAmount;

        emit Mint(msg.sender, _tokenAmount);

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

    function updateManagerList(address _manager, bool _status)
        external
        onlyOwner
        returns(bool)
    {
        _updateManagerList(_manager, _status);

        return true;
    }

    function _updateManagerList(address _manager, bool _status)
        internal
        returns(bool)
    {
        managers[_manager] = _status;

        return true;
    }

    function _withdrawERC20(address _token, address _recepient)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC20 tokenERC20 = IERC20(_token);
        tokenERC20.transfer(_recepient, tokenERC20.balanceOf(address(this)));

        return true;
    }

    function _withdrawERC721(address _token, address _recepient, uint _tokenId)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC721 tokenERC721 = IERC721(_token);
        tokenERC721.transferFrom(address(this), _recepient, _tokenId);

        return true;
    }
}