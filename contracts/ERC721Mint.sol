// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract ERC721Mint is ERC721, Ownable {
    string public uri;

    mapping(address => bool) public managers;

    uint public tokenId = 0;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721 (_name, _symbol) {
        uri = _uri;
        managers[msg.sender] = true;
    }

    modifier onlyManager() {
        require(
            managers[msg.sender], 
            'ERC721Mint: caller is not the manager'
        );
        _;
    }

    function _addManager(address _manager)
        external
        onlyOwner
        returns(bool)
    {
        require(!managers[_manager], 'ERC721Mint::_addManager: is already a manager');

        managers[_manager] = true;

        return true;
    }

    function _removeManager(address _manager)
        external
        onlyOwner
        returns(bool)
    {
        require(managers[_manager], 'ERC721Mint::_removeManager: is not a manager');

        managers[_manager] = false;

        return true;
    }

    function mint(address to) 
        external 
        onlyManager
        returns(uint) 
    {
        tokenId++;

        _mint(to, tokenId);

        return tokenId;
    }

    function burn(uint _tokenId) 
        external 
        onlyManager
        returns(bool) 
    {
        _burn(_tokenId);

        return true;
    }

    function tokenURI(uint _tokenId) 
        public 
        view 
        override
        returns(string memory) 
    {
        return super.tokenURI(_tokenId);
    }

    function _baseURI() 
        internal 
        view 
        override
        returns(string memory) 
    {
        return uri;
    }

    function _setNewURI(string memory _newURI) 
        external
        onlyOwner
        returns(bool) 
    {
        uri = _newURI;

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