pragma solidity >= 0.5.0 < 0.7.0;

contract SimpleStore {
  string public value;

  constructor(string memory _value) public {
    value = _value;
  }

  function setValue(string memory newValue) public {
    value = newValue;
  }

  function getValue() public view returns(string memory) {
    return value;
  }
}