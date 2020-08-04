let SimpleStore = artifacts.require('SimpleStore')

module.exports = function(_deployer) {
  _deployer.deploy(SimpleStore, 'Hello World')
};
