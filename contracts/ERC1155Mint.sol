// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Mint is ERC1155, Ownable {
    address public manager;

    constructor(string memory uri) ERC1155(uri) {
    }
    
    modifier onlyManager() {
        require(msg.sender == manager, "ERC1155Mint::mint: sender is not manager");
        _;
    }

    function mint(uint256 bundle, uint256 amount, address addr) external payable onlyManager returns (bool) {
        _mint(addr, bundle, amount, "");

        return true;
    }

    function setManager(address _manager) external onlyOwner returns (bool) {
        manager = _manager;

        return true;
    }
}
