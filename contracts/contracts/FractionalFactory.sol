// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FractionToken is ERC20 {
    address public assetContract;
    uint256 public assetTokenId;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        address assetContract_,
        uint256 assetTokenId_
    ) ERC20(name_, symbol_) {
        assetContract = assetContract_;
        assetTokenId = assetTokenId_;
        _mint(msg.sender, supply_);
    }
}

contract FractionalFactory is Ownable {
    event FractionCreated(
        address indexed tokenAddress,
        address indexed assetContract,
        uint256 assetTokenId
    );

    constructor() Ownable(msg.sender) {}

    function createFraction(
        string calldata name_,
        string calldata symbol_,
        uint256 supply_,
        address assetContract_,
        uint256 assetTokenId_
    ) external returns (address) {
        FractionToken token = new FractionToken(
            name_,
            symbol_,
            supply_,
            assetContract_,
            assetTokenId_
        );

        emit FractionCreated(
            address(token),
            assetContract_,
            assetTokenId_
        );

        return address(token);
    }
}
