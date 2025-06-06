// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IELACoin is IERC20 {
    function mint(address to, uint256 amount, bytes memory data) external;
    function burn(address from, uint256 amount) external;
}
