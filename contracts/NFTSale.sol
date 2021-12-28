// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "contracts/ERC1155Mint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
* @title  NFTSale.
* @author Smart contract development team.
* @dev This is a contract for the purchase of tokens by the user. 
* There is a whitelist so that users can participate in the presale for the amounts specified by the contract.
* The contract owner can turn sales/presales on and off, set a new URI, change the wallet address, 
* set maximum number of tokens to purchase, add bundles, change their price and supplies.
*/

contract NFTSale is Ownable {
    struct bundleData {
        uint amount;
        uint minted;
        uint rate;
    }

    bundleData[] public bundles;

    ERC1155Mint public token;
    address payable public wallet;
    uint public maxBuyAmount = 10;

    mapping(address => Amounts) public Accounts;

    struct Amounts {
        uint allowedAmount;
        uint buyedAmount;
    }

    bool public preSale = false;
    bool public sale = false;

    event Transfer(address _addr, uint _bundleId, uint _amount);

    constructor(address payable _wallet, address _token) {
        token = ERC1155Mint(_token);
        wallet = _wallet;

        _addBundle(100, 0.01 ether);
    }

    /// @notice  The function mints an specified token's amount of the bundle.
    /** @dev Checks: whether preSales are open or closed,
    preSale: is the desired number of tokens available to the whitelist participant, is not the desired amount of the allowed maximum greater than,
    does the specified bundle exist, is there enough ether for the purchase sent by the user, is the desired number of tokens available.
    If all checks are successfully passed, the function increases the value of the bundle in the minted array, 
    accepts ether and sends the specified number of tokens to the user's address.
    sale: the same thing only without checking for whitelist.
    */
    /// @param _bundleId The number of the desired bundle.
    /// @param _amount The number of the desired token's amount.
    /// @return The bool value.

    function buyToken(uint _bundleId, uint _amount) external payable returns (bool) {
        if (preSale) {
            require(Accounts[msg.sender].allowedAmount >= Accounts[msg.sender].buyedAmount + _amount, "NFTSale::buyToken: amount is more than allowed or you are not logged into whitelist");
            require(_amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(_bundleId < bundles.length, "NFTSale::buyToken: collection does not exist");
            require(msg.value == bundles[_bundleId].rate * _amount, "NFTSale::buyToken: not enough ether sent");

            bundles[_bundleId].minted += _amount;
            require(bundles[_bundleId].minted <= bundles[_bundleId].amount, "NFTSale::buyToken: not enough supply");

            wallet.transfer(msg.value);
            token.mint(_bundleId, _amount, msg.sender);
            emit Transfer(msg.sender, _bundleId, _amount);

            return true;
        }
        else if (sale) {
            require(_amount <= maxBuyAmount, "NFTSale::buyToken: amount can not exceed maxBuyAmount");
            require(_bundleId < bundles.length, "NFTSale::buyToken: collection does not exist");
            require(msg.value == bundles[_bundleId].rate * _amount, "NFTSale::buyToken: not enough ether sent");

            bundles[_bundleId].minted += _amount;
            require(bundles[_bundleId].minted <= bundles[_bundleId].amount, "NFTSale::buyToken: not enough supply");
            
            wallet.transfer(msg.value);
            token.mint(_bundleId, _amount, msg.sender);
            emit Transfer(msg.sender, _bundleId, _amount);
            
            return true;
        }
        else {
            revert("NFTSale::buyToken: sales are closed");
        }
    }

    /// @notice The function enables presales.
    /// @dev Stores the bool value in the states variables 'preSale' and 'sale'.
    /// @return The bool value.

    function _setPreSaleMode() external onlyOwner returns (bool) {
        preSale = true;
        sale = false;

        return true;
    }

    /// @notice The function enables sales and disables presales.
    /// @dev Stores the bool value in the states variables 'preSale' and 'sale'.
    /// @return The bool value.

    function _setSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = true;

        return true;
    }

    /// @notice The function disables sales and presales.
    /// @dev Stores the bool value in the states variables 'preSale' and 'sale'.
    /// @return The bool value.

    function _setNonSaleMode() external onlyOwner returns (bool) {
        preSale = false;
        sale = false;

        return true;
    }

    /// @notice The function adds a new account to whitelist.
    /// @dev Adds a new value to mapping.
    /// @param _account The new value to store.
    /// @param _amount The new value to store.
    /// @return The bool value.

    function _whitelistAdd(address _account, uint _amount) external onlyOwner returns (bool) {
        Accounts[_account].allowedAmount = _amount;
        
        return true;
    }

    /// @notice The function sets the maximum allowed number of tokens for 1 purchase.
    /// @dev Stores the value in the state variable 'maxBuyAmount'.
    /// @param _maxBuyAmount The number of the token's maximum for 1 purchase.
    /// @return The bool value.

    function _setMaxBuyAmount(uint _maxBuyAmount) external onlyOwner returns (bool) { 
        maxBuyAmount = _maxBuyAmount;
        
        return true;
    }

    /// @notice The function sets a new wallet.
    /// @dev Stores the address value in the state variable 'wallet'.
    /// @param _wallet The new value to store.
    /// @return The bool value.

    function _setWallet(address payable _wallet) external onlyOwner returns (bool) { 
        wallet = _wallet;
        
        return true;
    }

    /// @notice The function sets amount and rate for the specified bundle.
    /// @dev Stores the values of the variables 'amount' and 'rate' for the specified bundle in the array 'bundles'.
    /// @param _bundleId The bundle number.
    /// @param _amount The new value to store.
    /// @param _rate The new value to store.
    /// @return The bool value.

    function _setBundleData(uint _bundleId, uint _amount, uint _rate) external onlyOwner returns (bool) {
        bundles[_bundleId].amount = _amount;
        bundles[_bundleId].rate = _rate;

        return true;
    }

    /// @notice The function adds new bundles.
    /// @dev Adds a new element in the array 'bundles'.
    /// @param _amounts The supply of a new bundle.
    /// @param _rates The supply of a new bundle.
    /// @return The bool value.

    function _addBundles(uint[] calldata _amounts, uint[] calldata _rates) public onlyOwner returns (bool) {
        require(_amounts.length == _rates.length, 'NFTSale::addBundles: amounts length must be equal rates length');

        for(uint i = 0; i < _amounts.length; i++) {
            _addBundle(_amounts[i], _rates[i]);
        }

        return true;
    }

    /// @notice The function adds elements of a new bundle in the array 'bundles'.
    /// @dev The function adds characteristics of a new bundle in the array 'bundles'.
    /// @param _amount The supply of a new bundle.
    /// @param _rate The supply of a new bundle.
    /// @return The bool value.

    function _addBundle(uint _amount, uint _rate) internal returns (bool) {
        bundleData memory pass = bundleData({amount: _amount, minted: 0, rate: _rate});
        bundles.push(pass);

        return true;
    }

    /// @notice The function shows all existing bundles.
    /// @dev the function returns structures from the array 'bundles'.
    /// @return The array values.

    function getBundles() public view returns (bundleData[] memory) {

        return bundles;
    }

    /// @notice The function shows the number of existing bundles.
    /// @dev The function returns the the number of array's elements.
    /// @return The number.

    function getBundlesLength() public view returns (uint) {

        return bundles.length;
    }
}