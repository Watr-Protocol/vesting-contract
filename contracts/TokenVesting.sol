// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract TokenVesting is Ownable, ReentrancyGuard {
    address payee;
    uint256 genesis_timestamp;
    uint256 epoch_length;
    uint256 payout;
    uint8 number_of_epochs;
    constructor(address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation, uint256 _genesis_timestamp) {
        payee = _payee;
        epoch_length = _epoch_length;
        payout = allocation/_number_of_epochs;
        number_of_epochs = _number_of_epochs;
        genesis_timestamp = _genesis_timestamp;
    }

    receive() external payable {}

    function withdraw(address payable _to) nonReentrant public {
        require(_to == payee, "Cannot withdraw to this address");
        uint256 withdrawable = checkWithdrawable();
        require(withdrawable > 0, "Nothing to withdraw");
        (bool sent, ) = _to.call{value: withdrawable}("");
        require(sent, "failed to withdraw funds");
    }

    function checkWithdrawable() view public returns (uint256) {
        uint256 balance = address(this).balance;
        return balance - locked();
    }

    function locked() view public returns (uint256) {
        uint256 current_time = block.timestamp;
        uint256 interval = current_time - genesis_timestamp;
        uint256 epochs =number_of_epochs - Math.min(interval/epoch_length, number_of_epochs);
        return payout * epochs;
    } 
}