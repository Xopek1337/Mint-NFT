// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Test is ERC721 {
    uint tokenId = 5;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _safeMint(msg.sender, tokenId);
    }
}
