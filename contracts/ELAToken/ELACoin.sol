// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IELACoin.sol";

/**
 * @title ELACoin
 * @dev Implementation of a ELACoin
 */
contract ELACoin is IELACoin, ERC20 {
    address public constant MINTER = 0x0000000000000000000000000000000000000064;
    event Mintted(address indexed to, uint256 amount, bytes data);
    constructor() ERC20("Elastos", "ELA") {
    }

    /**
     * @dev Modifier that checks if the caller is an minter
     */
    modifier onlyMinter() {
        require(msg.sender == MINTER, "ELACoin: caller is not minter");
        _;
    }

    /**
     * @dev Mints new tokens. Only callable by minters.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount, bytes memory data) external onlyMinter {
       _mint(to, amount);
       emit Mintted(to, amount, data);
    }

    /**
     * @dev Burns tokens. Only callable by minter.
     * @param from The address whose tokens will be burned
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyMinter {
        _burn(from, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}
