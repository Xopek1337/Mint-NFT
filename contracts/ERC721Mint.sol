// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Mint is ERC721, Ownable {
    uint tokenId = 1;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
    }

    function mint(address to) external onlyOwner
    {
        _mint(to, tokenId);
        tokenId++;
    }
}