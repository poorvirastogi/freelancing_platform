// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Escrow {
    address public client;
    address public freelancer;
    uint256 public totalAmount;
    bool public isRefunded;
    string public jobId;

    uint256 public totalReleased;

    event Funded(address client, uint256 amount);
    event MilestoneReleased(address freelancer, uint256 amount, uint256 milestoneIndex);
    event Refunded(address client, uint256 amount);

    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }

    modifier notRefunded() {
        require(!isRefunded, "Already refunded");
        _;
    }

    constructor(address _freelancer, string memory _jobId) {
        require(_freelancer != address(0), "Invalid freelancer");
        client = msg.sender;
        freelancer = _freelancer;
        jobId = _jobId;
    }

    // Client deposits full budget upfront
    function deposit() external payable onlyClient notRefunded {
        require(msg.value > 0, "Must send ETH");
        require(totalAmount == 0, "Already funded");
        totalAmount = msg.value;
        emit Funded(msg.sender, msg.value);
    }

    // Client releases a specific percentage of total budget
    function releaseMilestone(uint256 percentage) external onlyClient notRefunded {
        require(totalAmount > 0, "Not funded yet");
        require(percentage > 0 && percentage <= 100, "Invalid percentage");
        uint256 milestoneAmount = (totalAmount * percentage) / 100;
        require(address(this).balance >= milestoneAmount, "Insufficient balance");
        uint256 milestoneIndex = totalReleased;
        totalReleased += milestoneAmount;
        (bool success, ) = payable(freelancer).call{value: milestoneAmount}("");
        require(success, "Transfer failed");
        emit MilestoneReleased(freelancer, milestoneAmount, milestoneIndex);
    }

    // Refund remaining balance to client
    function refund() external onlyClient notRefunded {
        require(address(this).balance > 0, "Nothing to refund");
        isRefunded = true;
        uint256 remaining = address(this).balance;
        (bool success, ) = payable(client).call{value: remaining}("");
        require(success, "Refund failed");
        emit Refunded(client, remaining);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getStatus() external view returns (
        address _client,
        address _freelancer,
        uint256 _totalAmount,
        bool _isFunded,
        bool _isCompleted,
        bool _isRefunded
    ) {
        bool funded = totalAmount > 0;
        bool completed = funded && address(this).balance == 0 && !isRefunded;
        return (client, freelancer, totalAmount, funded, completed, isRefunded);
    }
}
