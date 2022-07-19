// SPDX-License-Identifier: UNLICENSED
// NOTE: to find contract addy, you can also find the tx for contract creation on etherscan
// contract addy: 0x5f915BC854A5cBb8800021A350c9021088E354c1
// contract owner: 0x2F0cc4e3122C2a3b40aEC92CF0d86B36313c93D1 (account 4 MM)

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    //random number seed
    uint256 private seed;
    
    //event to indicate a new wave...
    event NewWave(address indexed from, uint256 timestamp, string message, uint256 prize);
    
    //wave struct object.
    struct Wave{
        address waver; //addy of person who waved
        string message; //message of person who waved
        uint256 timestamp; //time of when user waved
        uint256 prize; //the amount given
    }

    //waves array to store all waves.
    Wave[] waves;

    //mapping for when address last waved at us.
    mapping(address => uint256) public lastWavedAt;

    //constructor that runs at beginning of contract.
    constructor() payable {
        console.log("Yo yo, I am a contract and I am smart");
        seed = (block.timestamp + block.difficulty) % 100; //initializing seed
    }
    
    //wave function with message attached
    function wave(string memory _message) public {
        // Check our lastWavedAt mapping. Check for 
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30s"
        );
        //update the time.
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s has waved with message: %s", msg.sender, _message);
        seed = (block.difficulty + block.timestamp + seed) % 100; //give a new seed.
        console.log("Seed is now: %d", seed);
        uint256 prize = 0;
        uint256 prizeMultiplierAmount = 0.00001 ether;
        //use this seed to see if we give prize
        if(seed>=50){
            prize = prizeMultiplierAmount * seed;
            //issuing a reward to an address. This is diff than cryptoZombies way. 
            //the call.value methood is better for re-entrancy attacks.
            require(prize <= address(this).balance, "Not enough balance in smart contract.");
            (bool success, ) = (msg.sender).call{value: prize}("");
            require(success, "Failed to withdraw money from contract.");
            console.log("%s won %d eth!", msg.sender, prize);
        }
        waves.push(Wave(msg.sender,_message,block.timestamp, prize)); //push the wave into the array
        emit NewWave(msg.sender, block.timestamp, _message, prize);
    }

    //function to get all waves from the array.
    function getAllWaves() public view returns (Wave[] memory){
        return waves;
    }

    //will return number of total waves.
    function getTotalWaves() public view returns (uint256){
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function getBalance() public view returns(uint256) {
        return address(this).balance / 1 ether;
    }
}