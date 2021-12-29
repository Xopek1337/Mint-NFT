// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title  mintingPass.
 * @author bright lynx team.
 * @dev The mintingPass contract mints a specified number of bundles and counts the number of minted,
 * and does not allow the user to purchase more than the limit.
 * Users can buy the valid quantity of bundles.
 * The contract owner can turn sales on and off, set a new URI, change the wallet address, add bundles, change their price and supplies.
 */

contract MintingPass is ERC1155, Ownable {
    struct passData {
        uint256 amount;
        uint256 minted;
        uint256 rate;
    }

    passData[] public passes;

    address payable public wallet;
    bool public isPaused = true;

    constructor(address payable _wallet, string memory uri) ERC1155(uri) {
        require(
            _wallet != address(0),
            'MintingPass::constructor: wallet does not exist'
        );
        wallet = _wallet;

        _addPass(300, 0.03 ether);
        _addPass(150, 0.06 ether);
        _addPass(100, 0.09 ether);
        _addPass(75, 0.15 ether);
        _addPass(30, 0.3 ether);
        _addPass(15, 0.9 ether);
    }

    /// @notice  The function mints an specified amount of the bundle.
    /** @dev Checks: whether sales are open or closed, does the specified bundle exist,
    is there enough ether for the purchase sent by the user, is the desired number of tokens available.
    If all checks are successfully passed, the function increases the value of the bundle in the minted array, 
    accepts ether and sends the specified number of tokens to the user's address.
    */
    /// @param _passId The number of the desired bundle.
    /// @param _amount The number of the desired token's amount.
    /// @return The bool value.

    function mint(uint256 _passId, uint256 _amount)
        public
        payable
        returns (bool)
    {
        require(!isPaused, 'MintingPass::mint: contract is paused');
        require(
            _passId <= passes.length,
            'MintingPass::mint: passId does not exist'
        );
        require(
            msg.value == passes[_passId].rate * _amount,
            'MintingPass::mint: not enough ether sent'
        );

        passes[_passId].minted += _amount;
        require(
            passes[_passId].minted <= passes[_passId].amount,
            'MintingPass::mint: not enough supply'
        );

        _mint(msg.sender, _passId, _amount, '');

        wallet.transfer(msg.value);

        return true;
    }

    /// @notice The function enables or disables pause.
    /// @dev Stores the bool value in the state variable 'isPaused'.
    /// @param _pause The new value to store.
    /// @return The bool value.

    function _setPause(bool _pause) external onlyOwner returns (bool) {
        isPaused = _pause;

        return true;
    }

    /// @notice The function sets a new uri.
    /// @dev Calls the ERC1155 contract function to change the uri.
    /// @param _newUri The new value to store.
    /// @return The bool value.

    function _setNewURI(string memory _newUri)
        external
        onlyOwner
        returns (bool)
    {
        _setURI(_newUri);

        return true;
    }

    /// @notice The function sets a new wallet.
    /// @dev Stores the address value in the state variable 'wallet'.
    /// @param _wallet The new value to store.
    /// @return The bool value.

    function _setWallet(address payable _wallet)
        external
        onlyOwner
        returns (bool)
    {
        wallet = _wallet;

        return true;
    }

    /// @notice The function sets amount and rate for the specified bundle.
    /// @dev Stores the values of the variables 'amount' and 'rate' for the specified bundle in the array 'passes'.
    /// @param _passId The bundle number.
    /// @param _amount The new value to store.
    /// @param _rate The new value to store.
    /// @return The bool value.

    function _setPassData(
        uint256 _passId,
        uint256 _amount,
        uint256 _rate
    ) external onlyOwner returns (bool) {
        passes[_passId].amount = _amount;
        passes[_passId].rate = _rate;

        return true;
    }

    /// @notice The function adds new bundles.
    /// @dev Adds a new element in the array 'passes'.
    /// @param _amounts The supply of a new bundle.
    /// @param _rates The supply of a new bundle.
    /// @return The bool value.

    function _addPasses(uint256[] calldata _amounts, uint256[] calldata _rates)
        public
        onlyOwner
        returns (bool)
    {
        require(
            _amounts.length == _rates.length,
            'MintingPass::addPasses: amounts length must be equal rates length'
        );

        for (uint256 i = 0; i < _amounts.length; i++) {
            _addPass(_amounts[i], _rates[i]);
        }

        return true;
    }

    /// @notice The function adds elements of a new bundle in the array 'passes'.
    /// @dev The function adds characteristics of a new bundle in the array 'passes'.
    /// @param _amount The supply of a new bundle.
    /// @param _rate The supply of a new bundle.
    /// @return The bool value.

    function _addPass(uint256 _amount, uint256 _rate) internal returns (bool) {
        passData memory pass = passData({
            amount: _amount,
            minted: 0,
            rate: _rate
        });
        passes.push(pass);

        return true;
    }

    /// @notice The function shows all existing bundles.
    /// @dev the function returns structures from the array 'passes'.
    /// @return The array values.

    function getPasses() public view returns (passData[] memory) {
        return passes;
    }

    /// @notice The function shows the number of existing bundles.
    /// @dev The function returns the the number of array's elements.
    /// @return The number.

    function getPassesLength() public view returns (uint256) {
        return passes.length;
    }
}
