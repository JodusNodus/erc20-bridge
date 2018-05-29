# ERC20 - ERC777 bridge

A token bridge , inspired on the work of these projects :

- https://github.com/jacquesd/eip777
- https://github.com/paritytech/parity-bridge/

This bridge transfers any ERC20 token to an equivalent ERC777 token on another chain.

## Documentation

https://hackmd.io/s/rJDPfbZUG


# Status

## master branch

- Deposits and withdrawals work in the truffle test
- Basic verifications and contract audits have not been done
- main chain : withdrawal transaction can be executed by anyone
- main chain : withdrawer can set a reward in tokens for someone else to do the withdrawal

( This should be the preferred method to run the bridge )


# install / run / test

`npm i -g truffle`

`truffle test`

