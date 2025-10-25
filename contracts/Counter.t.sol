// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../contracts/Counter.sol";

contract CounterTest {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    function testIncrement() public {
        counter.increment();
        assert(counter.number() == 1);
    }

    function testSetNumber(uint256 x) public {
        counter.setNumber(x);
        assert(counter.number() == x);
    }

    function assert(bool condition) internal pure {
        require(condition, "Assertion failed");
    }
}
