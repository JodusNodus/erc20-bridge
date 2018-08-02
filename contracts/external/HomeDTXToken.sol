pragma solidity ^0.4.19;

import "./MiniMeToken.sol";


contract HomeDTXToken is MiniMeToken {

  function HomeDTXToken(address _tokenFactory) public MiniMeToken (
    _tokenFactory,
    0x0,                    // no parent token
    0,                      // no snapshot block number from parent
    "DaTa eXchange Token", // Token name
    18,                     // Decimals
    "DTX",                 // Symbol
    true                   // Enable transfers
    )
  {}

}
