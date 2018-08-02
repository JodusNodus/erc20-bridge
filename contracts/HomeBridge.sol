pragma solidity ^0.4.18;

import './external/Ownable.sol';
import './external/SafeMath.sol';
import './external/MiniMeToken.sol';

import './Validatable.sol';

contract HomeBridge is Ownable, Validatable, ApproveAndCallFallBack {
	using SafeMath for uint256;

	mapping(bytes32=>bool) usedHashes;

	event DepositReceived(address indexed _from, uint256 _amount, address _mainToken, bytes _data);
	
	function HomeBridge(uint8 _requiredValidators,address[] _initialValidators) Validatable(_requiredValidators,_initialValidators) public {

	}

	function checkValidations(
		bytes32 _hash,
		uint256 _length,
		uint8[] _v,
		bytes32[] _r,
		bytes32[] _s) public view returns(uint8){
		uint8 approvals = 0;
        for (uint i = 0; i < _length ; i++) {
        	address validator = ecrecover(_hash, _v[i], _r[i], _s[i]);
        	assert(isValidator(validator));
        	approvals++;
        }
        return approvals;
	}

	function withdraw(
		address _token,
		address _recipient,
		uint256 _amount,
		uint256 _withdrawblock,
		uint8[] _v,
		bytes32[] _r,
		bytes32[] _s) public {

		bytes32 hash = sha256(_token,_recipient,_amount,_withdrawblock);

		// the hash should not have been used before
		assert(usedHashes[hash] == false);

		// mark hash as used
		usedHashes[hash] = true;

		assert(_token != 0x0);

		assert(_recipient != 0x0);

		assert(_amount >= 0);

		// verify the provided signatures
		assert(_v.length > 0);
		assert(_v.length == _r.length);
		assert(_v.length == _s.length);

		// verify if the threshold of required signatures is met
		assert(checkValidations(hash,_v.length,_v,_r,_s) >= requiredValidators);
		// ERC-20 transfer
		MiniMeToken(_token).transfer(_recipient, _amount);
	}	

    function receiveApproval(address from, uint256 _amount, address _token, bytes _data) public {
		assert(from != 0x0);
		assert(_token != 0x0);
		assert(_amount > 0);

        require(MiniMeToken(_token).allowance(from, address(this)) >= _amount);
		MiniMeToken(_token).transferFrom(from, address(this), _amount);

		emit DepositReceived(from, _amount, _token, _data);
	}

}

