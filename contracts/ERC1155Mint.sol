// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Strings.sol";

/**
* @title  ERC1155Mint.
* @author bright lynx team.
* @dev The ERC1155Mint contract has one main function 'mint' to send the required tokens number of bundle to user. 
_mint is inherited from the ERC1155 contract by openzeppelin.
*/

contract ERC1155Mint is ERC1155, Ownable {
    address public manager;
    string public name;
    string public symbol;
    string public uri_;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC1155(uri_) {
        name = _name;
        symbol = _symbol;
        uri_ = _uri;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            'ERC1155Mint::mint: sender is not manager'
        );
        _;
    }

    /// @notice The function mints an specified amount of the bundle.
    /// @dev Creates `amount` tokens of token type `bundleId`, and assigns them to `addr`.
    /// @param _bundleId The number of the desired bundle.
    /// @param _amount The number of the desired token's amount.
    /// @param _addr The address of the token recipient.
    /// @return The bool value.

    function mint(
        uint256 _bundleId,
        uint256 _amount,
        address _addr
    ) external payable onlyManager returns (bool) {
        _mint(_addr, _bundleId, _amount, '');

        return true;
    }

    /// @dev The function assigns the specified address to the manager.
    /// @param _manager The assigned address.
    /// @return The bool value.

    function setManager(address _manager) external onlyOwner returns (bool) {
        manager = _manager;

        return true;
    }

    function uri(uint256 _bundleId)
        public
        override 
        view 
        returns (string memory) 
    {
        return string(abi.encodePacked(uri_, "/", Strings.toString(_bundleId)));
    }
}
