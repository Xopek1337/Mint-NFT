// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract ERC721Mint is ERC721Enumerable, Ownable {
    address public manager;
    string public uri_;

    uint public tokenId = 0;

    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721 (_name, _symbol) {
        uri_ = _uri;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            'test: sender is not manager'
        );
        _;
    }

    function setManager(address _manager) external onlyOwner returns (bool) {
        manager = _manager;

        return true;
    }

    function mint(address to) external onlyManager returns (uint) {
        tokenId++;

        _mint(to, tokenId);

        return tokenId;
    }

    function burn(uint256 tokenId) external onlyManager returns (bool) {
        //require(tokenId > 10000, 'test: tokenId is insufficient for burning'); тут чет с getBot
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'test: caller is not owner nor approved');

        _burn(tokenId);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }

        return true;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'test: URI query for nonexistent token');

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

     function _baseURI() internal view virtual override returns (string memory) {
        return uri_;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), 'test: URI set of nonexistent token');
        _tokenURIs[tokenId] = _tokenURI;
    }

}