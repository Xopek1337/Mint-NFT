// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Mint is ERC1155, Ownable {
    constructor(string memory uri) ERC1155(uri) {
    }

    function mint(uint256 collectionId, uint256 amount, address addr) public payable onlyOwner returns (bool) {
        _mint(addr, collectionId, amount, "");

        return true;
    }
}