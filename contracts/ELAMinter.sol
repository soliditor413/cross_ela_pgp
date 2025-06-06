// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ELAToken/IELACoin.sol";
// import "./ELAToken/ELACoin.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract ELAMinter is ReentrancyGuard {
    event PayloadReceived(string _addr, uint256 _amount, uint256 _crosschainamount, address indexed _sender);
    event Recharged(bytes32 indexed _elaHash, address indexed _target, uint256 amount, bytes smallRechargeData);
    event RefundWithdraw(bytes32 indexed _withdrawTxID, address indexed _target, uint256 amount, bytes signatures);
    struct RechargeData {
        address targetAddress;
        uint256 targetAmount;
        uint256 fee;
        bytes targetData;
    }
    struct WithdrawData {
        address targetAddress;
        uint256 targetAmount;
        bytes signatures;
    }
    mapping(bytes32 => bool) public completed;
    IELACoin public constant _ELACoin = IELACoin(0x0000000000000000000000000000000000000065);
    constructor() {
    }

    function getRechargeData(bytes32 elaHash) public view returns (RechargeData[] memory) {
        address method = address(1009);
        (bool success, bytes memory result) = method.staticcall(abi.encode(elaHash));
        require(success, "call failed");
        return decodeRechargeData(result);
    }

    function decodeRechargeData(bytes memory data) public pure returns (RechargeData[] memory) {
        // The first 32 bytes is the array length
        uint256 arrayLength = abi.decode(data, (uint256));
    
        // Initialize the array
        RechargeData[] memory rechargeDataArray = new RechargeData[](arrayLength);

        // Skip the array length (32 bytes)
        uint256 offset = 32;

        for (uint256 i = 0; i < arrayLength; i++) {
            // Decode each field
            address targetAddress;
            uint256 targetAmount;
            uint256 fee;
            bytes memory targetData;
            // Read targetAddress (20 bytes)
            assembly {
                let ptr := add(add(data, 0x20), offset)
                targetAddress := and(
                    mload(ptr),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
            offset += 32;

            // Read targetAmount (uint256)
            assembly {
                targetAmount := mload(add(add(data, 0x20), offset))
            }
            offset += 32;

            // Read fee (uint256)
            assembly {
                fee := mload(add(add(data, 0x20), offset))
            }
            offset += 32;

            // Read targetData (dynamic bytes)
            uint256 dataOffset;
            uint256 dataLength;
            assembly {
                // Get the offset to the actual data
                dataOffset := mload(add(add(data, 0x20), offset))
                // // Read the length of the targetData
                dataLength := mload(add(add(data, 0x20), dataOffset))
            }
            // Allocate memory for targetData
            targetData = new bytes(dataLength);
            
            // Copy the data
            assembly {
                let sourcePtr := add(add(data, 0x20), add(dataOffset, 0x20))
                for { let j := 0 } lt(j, dataLength) { j := add(j, 32) } {
                    mstore(add(add(targetData, 0x20), j), mload(add(sourcePtr, j)))
                }
            }

            offset += 32;
            // Store in the array
            rechargeDataArray[i] = RechargeData({
                targetAddress: targetAddress,
                targetAmount: targetAmount,
                fee: fee,
                targetData: targetData
            });
        }
        return rechargeDataArray;
    }

    function Recharge(bytes32 elaHash, bytes calldata smallRechargeData) public nonReentrant {
        require(!completed[elaHash], "ELAMinter: already completed");
        completed[elaHash] = true;
        RechargeData[] memory rechargeDataArray = getRechargeData(elaHash);
        for (uint256 i = 0; i < rechargeDataArray.length; i++) {
            address targetAddress = rechargeDataArray[i].targetAddress;
            uint256 targetAmount = rechargeDataArray[i].targetAmount;
            uint256 fee = rechargeDataArray[i].fee;
            require(targetAmount >= fee, "NotEnoughFee");
            require(targetAddress != address(0), "InvalidAddress");
            bytes memory targetData = rechargeDataArray[i].targetData;
            _ELACoin.mint(targetAddress, targetAmount - fee, targetData);
            _ELACoin.mint(msg.sender, fee, "");

            emit Recharged(elaHash, targetAddress, targetAmount - fee, smallRechargeData);
            emit Recharged(elaHash, msg.sender, fee, smallRechargeData);
        }
    }

    function withdraw(string memory _addr, uint256 _amount, uint256 _fee) public nonReentrant {
        uint256 balance = _ELACoin.balanceOf(msg.sender);
        require(balance >= _amount + _fee, "balance not enough");
        require(_fee >= 10000 && _fee % 10000 == 0, "ErrorFee");
        require(_amount % 10000 == 0 && _amount > _fee && _amount - _fee >= _fee, "ErrorAmount");
        _ELACoin.burn(msg.sender, _amount + _fee);
        emit PayloadReceived(_addr, _amount, _amount - _fee, msg.sender);
    }

    function getWithdrawData(bytes32 withdrwTxID) public view returns (address, uint256, bytes memory) {
        address method = address(1010);
        (bool success, bytes memory result) = method.staticcall(abi.encode(withdrwTxID));
        require(success, "call failed");
        WithdrawData memory withdrawData;
        withdrawData = abi.decode(result, (WithdrawData));
        return (withdrawData.targetAddress, withdrawData.targetAmount, withdrawData.signatures);
    }

    function refundWithdraw(bytes32 withdrwTxID) public nonReentrant {
        require(!completed[withdrwTxID], "ELAMinter: already completed");
        completed[withdrwTxID] = true;
        (address targetAddress, uint256 targetAmount, bytes memory signatures) = getWithdrawData(withdrwTxID);
        _ELACoin.mint(targetAddress, targetAmount, signatures);
        emit RefundWithdraw(withdrwTxID, targetAddress, targetAmount, signatures);
    }

    receive() external payable {
        revert();
    }
}
