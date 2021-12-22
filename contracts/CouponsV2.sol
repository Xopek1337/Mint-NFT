// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Coupon is ERC1155, Ownable {
    struct CouponData {
        uint amount;
        uint minted;
        uint rate;
    }

    CouponData[] public coupones;

    address payable public wallet;
    bool public isPaused = false;

    constructor(address payable _wallet, string memory uri) ERC1155(uri) {
        wallet = _wallet;

        addCoupon(300, 0.03 ether);
        addCoupon(150, 0.06 ether);
        addCoupon(100, 0.09 ether);
        addCoupon(75, 0.15 ether);
        addCoupon(30, 0.3 ether);
        addCoupon(15, 0.9 ether);
    }

    function mint(uint256 couponId, uint256 amount) public payable returns (bool) {
        require(isPaused, "Coupon::mint: contract is paused");
        require(couponId <= coupones.length, "Coupon::mint: CouponId doesn't exist");
        require(msg.value == coupones[couponId].rate * amount, "Coupon::mint: not enough ether sent");

        coupones[couponId].minted += amount;
        require(coupones[couponId].minted <= coupones[couponId].amount, "Coupon::mint: not enough supply");

        _mint(msg.sender, couponId, amount, "");

        wallet.transfer(msg.value);

        return true;
    }

    function _setPause(bool pause) external onlyOwner returns (bool) {
        isPaused = pause;

        return true;
    }

    function _setNewURI(string memory _newUri) external onlyOwner returns (bool) {
        _setURI(_newUri);

        return true;
    }

    function _setWallet(address payable _wallet) external onlyOwner returns (bool) {
        wallet = _wallet;

        return true;
    }

    function _setCouponData(uint couponId, uint amount, uint rate) external onlyOwner returns (bool) {
        coupones[couponId].amount = amount;
        coupones[couponId].rate = rate;

        return true;
    }

    function _addCoupones(uint[] calldata amounts, uint[] calldata rates) public onlyOwner returns (bool) {
        require(amounts.length == rates.length, 'Coupon::addCoupones: amounts length must be equal rates length');

        for(uint i = 0; i < amounts.length; i++) {
            addCoupon(amounts[i], rates[i]);
        }

        return true;
    }

    function addCoupon(uint amount, uint rate) internal returns (bool) {
        CouponData memory pass = CouponData({amount: amount, minted: 0, rate: rate});
        coupones.push(pass);

        return true;
    }

    function getCoupones() public view returns (CouponData[] memory) {
        return coupones;
    }

    function getCouponesLength() public view returns (uint) {
        return coupones.length;
    }
}