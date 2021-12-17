// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Coupons is ERC1155, Ownable {
    uint256[] public supplies = [100, 90, 70, 50, 30, 10]; // количество купонов
    uint256[] public minted = [0, 0, 0, 0, 0, 0]; // для проверки сколько будет заминчино
    uint256[] public rates = [0.03 ether, 0.06 ether, 0.09 ether, 0.15 ether, 0.3 ether, 0.9 ether]; // цена купонов
    address payable public wallet;
    bool public sale = false;

    constructor(address payable _wallet, string memory uri) ERC1155(uri) {
        wallet = _wallet;
    }
    
    function mint(uint256 collectionId, uint256 amount) public payable returns (uint256[] memory)
    {
        require(sale == true, "Coupons::mint: Sales are closed"); // проверка на saleMode
        require(collectionId <= supplies.length, "Coupons::mint: Collection doesn't exist"); // проверка на существование коллекции
        require(collectionId > 0, "Coupons::mint: Collection doesn't exist");

        uint index = collectionId - 1;
        uint mintedAmount = minted[index] + amount;
        require(mintedAmount <= supplies[index], "Coupons::mint: Not enough supply"); // проверка на предложение
        minted[index] = mintedAmount;
        require(msg.value == rates[index] * amount, "Coupons::mint: Not enough ether sent"); // проверка на покупательскую способность

        wallet.transfer(msg.value); // переводим эфир на указанный кошелек
        _mint(msg.sender, collectionId, amount, "");
        minted[index] += amount;

        return minted;
    }

    function setSaleMode() external onlyOwner returns (bool) {
        sale = true;

        return true;
    }

    function setNonSaleMode() external onlyOwner returns (bool) {
        sale = false;

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
    // надо сделать функции изменения стоимости купонов и их количества
}