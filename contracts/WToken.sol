pragma solidity =0.5.12;


import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

/**
 * Simple contract for ether substitution
 *
 */
contract WToken is ERC20Burnable {


    /**
     * @dev fallback
     * To purchase the token, just transfer ether to the contract
     * Rate is fixed forever - 1 token for 1 wei
     */
    function () external payable {
        _mint(msg.sender, msg.value);
    }


    /**
     * @dev burn
     * Burns tokens and returns ether to the sender
     * @param amount number of tokens to burn and wei to receive
     */
    function burn(uint256 amount) public
    {
        _burn(msg.sender, amount);
        msg.sender.transfer(amount);
    }

}
