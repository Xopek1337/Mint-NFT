// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Coupons is ERC1155, Ownable {
    uint256[] public supplies = [100, 90, 70, 50, 30, 10];
    uint256[] public minted = [0, 0, 0, 0, 0, 0];
    uint256[] public rates = [0.03 ether, 0.06 ether, 0.09 ether, 0.15 ether, 0.3 ether, 0.9 ether];
    address payable public wallet;
    
    bool public sale = false;

    constructor(address payable _wallet, string memory uri) ERC1155(uri) {
        wallet = _wallet;
    }
    
    function mint(uint256 collectionId, uint256 amount) public payable returns (bool) {
        require(sale, "Coupons::mint: Sales are closed");
        require(collectionId < supplies.length, "Coupons::mint: Collection doesn't exist");
        require(collectionId >= 0, "Coupons::mint: Collection doesn't exist");
        require(msg.value == rates[collectionId] * amount, "Coupons::mint: Not enough ether sent");

        minted[collectionId] += amount;
        require(minted[collectionId] <= supplies[collectionId], "Coupons::mint: Not enough supply");
        
        wallet.transfer(msg.value);
        _mint(msg.sender, collectionId, amount, "");

        return true;
    }

    function setSaleMode(bool mode) external onlyOwner returns (bool) {
        sale = mode;

        return true;
    }

    function setURI(string memory _newUri) external onlyOwner returns (bool) {
        _setURI(_newUri);

        return true;
    }

    function setWallet(address payable _wallet) external onlyOwner returns (bool) {
        wallet = _wallet;

        return true;
    }

    function getCouponSupplies() public view returns (uint256[] memory) {
        return supplies;
    }

    function getMintedCoupons() public view returns (uint256[] memory) {
        return minted;
    }

    function getCouponRates() public view returns (uint256[] memory) {
        return rates;
    }

    function changeCouponPrice(uint collectionId, uint price) external onlyOwner returns (bool) {
        rates[collectionId] = price;
        
        return true;
    }

    function changeCouponAmount(uint collectionId, uint amount) external onlyOwner returns (bool) {
        supplies[collectionId] = amount;
        
        return true;
    }
    
    function addCoupons(uint[] calldata _supplies, uint[] calldata _rates) external onlyOwner returns (bool) {
        require(_supplies.length == _rates.length, 'Coupon::addCoupones: amounts length must be equal rates length');

        for(uint i = 0; i < _supplies.length; i++) {
            supplies.push(_supplies[i]);
            rates.push(_rates[i]);
            minted.push(0);
        }
        return true;
    }
}