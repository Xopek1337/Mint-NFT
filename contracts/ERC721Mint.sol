// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../node_modules/@openzeppelin/contracts/access/AccessControl.sol';

contract ERC721Mint is ERC721Enumerable, Ownable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 public constant BURNER_ROLE = keccak256('BURNER_ROLE');

    string public uri;

    uint public tokenId = 0;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC721 (_name, _symbol) {
        uri = _uri;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _setMinter(address _minter) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        returns (bool) 
    {
        grantRole(MINTER_ROLE, _minter);

        return true;
    }

     function _setBurner(address _burner) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        returns (bool) 
    {
        grantRole(BURNER_ROLE, _burner);

        return true;
    }

    function mint(address to) 
        external 
        onlyRole(MINTER_ROLE)
        returns (bool) 
    {
        tokenId++;

        _mint(to, tokenId);

        return true;
    }

    function burn(uint _tokenId) 
        external 
        onlyRole(BURNER_ROLE)
        returns (bool) 
    {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), 'ERC721Mint::burn: caller is not owner nor approved');

        _burn(_tokenId);

        return true;
    }

    function tokenURI(uint _tokenId) 
        public 
        view 
        override
        returns (string memory) 
    {
        return super.tokenURI(_tokenId);
    }

     function _baseURI() 
        internal 
        view 
        override
        returns (string memory) 
    {
        return uri;
    }

    function _setNewURI(string memory _newURI) 
        external
        onlyOwner
        returns (bool) 
    {
        uri = _newURI;

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

    function _withdrawERC721(IERC721 tokenContract, address recepient, uint _tokenId)
        external 
        onlyOwner 
        returns(bool) 
    {
        tokenContract.transferFrom(address(this), recepient, _tokenId);

        return true;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC721Enumerable, AccessControl) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId) &&
        interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }
}