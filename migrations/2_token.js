const WToken = artifacts.require("WToken");

module.exports = function(deployer) {
  deployer.deploy(WToken);
};
