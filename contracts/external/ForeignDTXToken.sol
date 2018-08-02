pragma solidity ^0.4.20;

import "@settlemint/solidity-mint/contracts/marketplaces/tokensystem/Token.sol";

/**
 * Contains the DTX token
 */
contract ForeignDtxToken is Token {

  function ForeignDtxToken(
    bytes32 _name,
    uint8 _decimals,
    address _registry,
    address _gateKeeper
  )
    Token(
      _name,
      _decimals,
      _registry,
      _gateKeeper
    )
    public
  {}

  function getIndexLength() public view returns (uint length) {
    length = tokenHolders.length;
  }

  function getByIndex(uint index) view public returns (address key, uint256 balance) {
    key = tokenHolders[index];
    balance = balances[tokenHolders[index]].balance;
  }

  function getByKey(address _key) view public returns (address key, uint256 balance) {
    key = _key;
    balance = balances[_key].balance;
  }

}