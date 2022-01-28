// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import './ERC721Mint.sol';
import './MintingPass.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';


contract SaleToken is Ownable {
    ERC721Mint public token;
    MintingPass public mintingPass;

    address payable public wallet;
    address[] public managers;

    uint public maxTokenAmount = 10000;
    uint public boughtAmount = 0;
    uint public maxBuyAmount = 3;
    uint public price = 0.1 ether;
    uint public discountPrice = 0.09 ether;

    bytes32 public merkleRoot;

    mapping(address => Amounts) public Accounts;
    mapping(uint => uint) public amountsFromId;

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

        amountsFromId[0] = 3;
        amountsFromId[1] = 6;
        amountsFromId[2] = 9;
        amountsFromId[3] = 15;
        amountsFromId[4] = 30;
        amountsFromId[5] = 90;
    }

    modifier onlyManager() {
        bool isManager = false;
        for(uint i = 0; i < managers.length; i++) {
            if(msg.sender == managers[i]) {
                isManager = true;
                break;
            }
        }
        require(isManager, 'SaleToken:: sender is not manager');
        _;
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
            if(Accounts[msg.sender].isTakePartInSale) {
                require(
                    amountsFromId[idPass] >= _amount,
                    'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
                );
            }
            else {
                require(
                    Accounts[msg.sender].allowed + amountsFromId[idPass] >= _amount,
                    'SaleToken::sale: amount is more than allowed or you are not logged into whitelist'
                );
            }

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
                Accounts[msg.sender].bought + _amount >= maxBuyAmount + amountsFromId[idPass],
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

        return true;
    }

    function _setPause()
        external
        onlyManager
        returns (bool)
    {
        publicSale = false;
        privateSale = false;

        return true;
    }

    function whitelistAdd(bytes32[] calldata _merkleProof, uint amount) public returns (bool) {
        require(!Accounts[msg.sender].isClaimed, "SaleToken::whitelistAdd: address has already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "SaleToken::whitelistAdd: Invalid proof");

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

    function _setMerkleRoot(bytes32 _root) 
        external 
        onlyOwner 
        returns (bool) 
    {
        merkleRoot = _root;

        return true;
    }

    function _setMaxTokenAmount(uint _amount) 
        external 
        onlyOwner 
        returns(bool) 
    {
        maxTokenAmount = _amount;

        return true;
    }

    function _setManagers(address[] memory _managers) 
        external 
        onlyOwner 
        returns(bool)
    {
        managers = _managers;

        return true;
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