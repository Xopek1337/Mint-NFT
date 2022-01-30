// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol';

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

    function _updateManagerList(address _manager, bool _status)
        external
        onlyOwner
        returns(bool)
    {
        if (_status == true) {
            require(!managers[_manager], 'ERC721Mint::_updateManagerList: is already a manager');
        }
        if (_status == false) {
            require(managers[_manager], 'ERC721Mint::_updateManagerList: is not a manager');
        }

        managers[_manager] = _status;

        return true;
    }

    function mint(address to) 
        external 
        onlyManager
        returns(bool) 
    {
        _mint(to, tokenId);

        tokenId++;

        return true;
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

    function _withdrawERC20(address _token, address _recepient)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC20 token = IERC20(_token);
        token.transfer(_recepient, token.balanceOf(address(this)));

        return true;
    }

    function _withdrawERC721(address _token, address _recepient, uint _tokenId)
        external 
        onlyOwner 
        returns(bool) 
    {
        IERC721 token = IERC721(_token);
        token.transferFrom(address(this), _recepient, _tokenId);

        return true;
    }
}