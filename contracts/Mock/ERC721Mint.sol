// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Mint is ERC721 {
    uint public tokenId = 0;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
    }

    function mint(address to) external returns (uint)
    {
        tokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}