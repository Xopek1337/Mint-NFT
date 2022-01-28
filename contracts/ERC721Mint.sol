// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

contract ERC721Mint is ERC721Enumerable, Ownable {
    address public manager;
    string public uri_;

    uint public tokenId = 0;

    mapping(uint => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721 (_name, _symbol) {
        uri_ = _uri;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            'ERC721Mint: sender is not manager'
        );
        _;
    }

    function setManager(address _manager) 
        external 
        onlyOwner 
        returns (bool) 
    {
        manager = _manager;

        return true;
    }

    function mint(address to) 
        external 
        onlyManager 
        returns (bool) 
    {
        tokenId++;

        _mint(to, tokenId);

        return true;
    }

    function burn(uint tokenId) 
        external 
        onlyManager 
        returns (bool) 
    {
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'ERC721Mint::burn: caller is not owner nor approved');

        _burn(tokenId);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }

        return true;
    }

    function tokenURI(uint tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), 'ERC721Mint::tokenURI: URI query for nonexistent token');

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }

        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

     function _baseURI() 
        internal 
        view 
        override
        returns (string memory) 
    {
        return uri_;
    }

    function _setTokenURI(uint tokenId, string memory _tokenURI) 
        internal 
        virtual 
        returns (bool) 
    {
        require(_exists(tokenId), 'ERC721Mint::_setTokenURI: URI set of nonexistent token');
        _tokenURIs[tokenId] = _tokenURI;

        return true;
    }
}