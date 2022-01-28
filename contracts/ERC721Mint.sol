// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract ERC721Mint is ERC721Enumerable, Ownable {
    address public minter;
    address public burner;
    string public uri;

    uint public tokenId = 0;

    mapping(uint => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721 (_name, _symbol) {
        uri = _uri;
    }

    modifier onlyMinter() {
        require(
            msg.sender == minter,
            'ERC721Mint: sender is not minter'
        );
        _;
    }

    modifier onlyBurner() {
        require(
            msg.sender == burner,
            'ERC721Mint: sender is not burner'
        );
        _;
    }

    function _setMinter(address _minter) 
        external 
        onlyOwner 
        returns (bool) 
    {
        minter = _minter;

        return true;
    }

     function _setBurner(address _burner) 
        external 
        onlyOwner 
        returns (bool) 
    {
        burner = _burner;

        return true;
    }

    function mint(address to) 
        external 
        onlyMinter
        returns (uint) 
    {
        tokenId++;

        _mint(to, tokenId);

        return tokenId;
    }

    function burn(uint _tokenId) 
        external 
        onlyBurner
        returns (bool) 
    {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), 'ERC721Mint::burn: caller is not owner nor approved');

        _burn(_tokenId);

        if (bytes(_tokenURIs[_tokenId]).length != 0) {
            delete _tokenURIs[_tokenId];
        }

        return true;
    }

    function tokenURI(uint _tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(_tokenId), 'ERC721Mint::tokenURI: URI query for nonexistent token');

        string memory _tokenURI = _tokenURIs[_tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
            //return string(abi.encodePacked(base, '/', _tokenURI));
        }

        return super.tokenURI(_tokenId);
        //return string(abi.encodePacked(_baseURI(), '/', Strings.toString(_tokenId)));
    }

     function _baseURI() 
        internal 
        view 
        override
        returns (string memory) 
    {
        return uri;
    }

    function _setTokenURI(uint _tokenId, string memory _tokenURI) 
        internal 
        virtual 
        onlyOwner
        returns (bool) 
    {
        require(_exists(_tokenId), 'ERC721Mint::_setTokenURI: URI set of nonexistent token');
        _tokenURIs[_tokenId] = _tokenURI;

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

    function _withdrawERC721(IERC721 tokenContract, address recepient, uint tokenId) 
        external 
        onlyOwner 
        returns(bool) 
    {
        tokenContract.transferFrom(address(this), recepient, tokenId);

        return true;
    }
}