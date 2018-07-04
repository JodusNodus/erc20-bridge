pragma solidity ^0.4.18;

import 'erc777/contracts/examples/ReferenceToken.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import './Validatable.sol';

contract ForeignERC777Bridge is Ownable, Validatable {

	mapping(bytes32=>uint8) public mintRequests;
	mapping(bytes32=>bool) public mintRequestsDone;
	mapping(bytes32=>bool) public signRequestsDone;

	mapping(bytes32=>uint8) public withdrawRequests;
	mapping(address=>bool) public validators;

	// maps home token addresses -> foreign token addresses
	mapping(address=>address) public tokenMap;
    address[] public registeredTokens;

	event WithdrawRequest(address _to,uint256 _amount,bytes32 _withdrawhash);
	event TokenAdded(address _mainToken,address _sideToken);
	event MintRequestSigned(bytes32 _mintRequestsHash, bytes32 _transactionHash,address _mainToken, address _recipient,uint256 _amount,uint8 _requiredSignatures,uint8 _signatureCount,bytes32 _signRequestHash);
	event MintRequestExecuted(bytes32 _mintRequestsHash, bytes32 _transactionHash,address _mainToken, address _recipient,uint256 _amount);

	event WithdrawRequestSigned(bytes32 _withdrawRequestsHash, bytes32 _transactionHash,address _mainToken, address _recipient,uint256 _amount,uint256 _withdrawBlock,address _signer, uint8 _v, bytes32 _r, bytes32 _s);

	event WithdrawRequestRewardSigned(bytes32 _withdrawRequestsHash,uint _reward,uint8 _v, bytes32 _r, bytes32 _s);

	function ForeignERC777Bridge(uint8 _requiredValidators,address[] _initialValidators) Validatable(_requiredValidators,_initialValidators) public {
		// deploy a sidechain ETH token as an ERC-777.
		//address t = new ReferenceToken('sidechain ETH','sETH',1);
		//assert(t != 0x0);
		//tokenMap[0x0] = t;
	}

	function registerToken(DetailedERC20 _mainToken) public onlyOwner {
		assert(tokenMap[_mainToken] == 0);
		ReferenceToken t = new ReferenceToken('Bridged Token','BTOK',1);
		assert(t.owner() == address(this));
		//t.transferOwnership(this);
		tokenMap[_mainToken] = t;
        registeredTokens.push(_mainToken);
		emit TokenAdded(_mainToken,address(t));
	}

    function tokens() public view returns(address[]) {
        return registeredTokens;
    }

	function signMintRequest(bytes32 _transactionHash,address _mainToken, address _recipient,uint256 _amount,uint8 _v, bytes32 _r, bytes32 _s) public {
		bytes32 mintRequestsHash = sha256(_transactionHash,_mainToken,_recipient,_amount);
		address validator = ecrecover(mintRequestsHash, _v, _r, _s);
		assert(isValidator(validator));

		bytes32 signRequestHash = sha256(mintRequestsHash,validator);
		assert(signRequestsDone[signRequestHash] != true);
		
		signRequestsDone[signRequestHash] = true;
		mintRequests[mintRequestsHash]++;
		if (mintRequests[mintRequestsHash] < requiredValidators){
			emit MintRequestSigned(mintRequestsHash,_transactionHash, _mainToken,  _recipient, _amount,requiredValidators,mintRequests[mintRequestsHash],signRequestHash);
		}else{
			assert(mintRequestsDone[mintRequestsHash] != true);
			assert(tokenMap[_mainToken] != 0x0);
			mintRequestsDone[mintRequestsHash] = true;
			emit MintRequestExecuted(mintRequestsHash,_transactionHash, tokenMap[_mainToken],  _recipient, _amount);
			ReferenceToken(tokenMap[_mainToken]).mint(_recipient,_amount,'');
		}
	}

	function signWithdrawRequest(bytes32 _transactionHash,address _mainToken, address _recipient,uint256 _amount,uint256 _withdrawBlock,uint8 _v, bytes32 _r, bytes32 _s) public {
		bytes32 withdrawRequestsHash = sha256(_mainToken,_recipient,_amount,_withdrawBlock);
		address validator = ecrecover(withdrawRequestsHash, _v, _r, _s);
		assert(isValidator(validator));		
		emit WithdrawRequestSigned(withdrawRequestsHash,_transactionHash, _mainToken,  _recipient, _amount,_withdrawBlock,validator,_v,_r,_s);
	}

	function signWithdrawRequestReward(bytes32 _withdrawRequestsHash,uint _reward,uint8 _v, bytes32 _r, bytes32 _s) public {
		emit WithdrawRequestRewardSigned(_withdrawRequestsHash,_reward,_v,_r,_s);
	}



}

