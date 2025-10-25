// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../contracts/MyToken.sol";

contract MyTokenTest {
    MyToken public myToken;

    function setUp() public {
        myToken = new MyToken();
    }

    function testInitialSupply() public {
        assert(myToken.totalSupply() == 1000000 * 10**18);
    }

    function testName() public {
        assert(keccak256(bytes(myToken.name())) == keccak256(bytes("MyToken")));
    }

    function testSymbol() public {
        assert(keccak256(bytes(myToken.symbol())) == keccak256(bytes("MTK")));
    }

    function assert(bool condition) internal pure {
        require(condition, "Assertion failed");
    }
}
