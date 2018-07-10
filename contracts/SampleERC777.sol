pragma solidity ^0.4.18;

import 'erc777/contracts/examples/ReferenceToken.sol';

contract SampleERC777 is ReferenceToken {
  function SampleERC777() public ReferenceToken("Sample ERC777 Token", "SAMPLE", 1) {

  }
}

