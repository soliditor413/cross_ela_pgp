import { ethers, network } from "hardhat";
import { readConfig } from "./helper";

async function main() {
  // Get the contract instance
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get the ELAMinter contract address from config
  const elaminterAddress = await readConfig(network.name, "elaminter");
  const elaminter = await ethers.getContractAt("ELAMinter", elaminterAddress);

  // Replace with the actual withdrawal transaction ID you want to refund
  const withdrawTxId = "0xb9c96d14f9b2ddc8fd4b885a3f4492b2a25a8c243613d6c8168926954a04054d";
  
  try {
    
    // First, check if the transaction is already completed
    const isCompleted = await elaminter.completed(withdrawTxId);
    if (isCompleted) {
      console.log("This withdrawal has already been refunded");
      return;
    }

        
    // Get the withdraw data for verification
    console.log("Fetching withdraw data...");
    const [targetAddress, targetAmount, signatures] = await elaminter.getWithdrawData(withdrawTxId);
    console.log("targetAddress ", targetAddress);
    console.log("targetAmount ", targetAmount);
    console.log("signatures ", signatures);

    
    // Ask for confirmation before proceeding
    console.log("\nAbout to process refund. This will mint tokens to the target address.");
    console.log("Are you sure you want to continue? (y/n)");
    
    // For automation, you can remove the confirmation prompt
    const confirm = await new Promise(resolve => {
      process.stdin.once('data', data => {
        resolve(data.toString().trim().toLowerCase() === 'y');
      });
    });

    if (!confirm) {
      console.log("Refund cancelled");
      return;
    }

    // Process the refund
    console.log("\nProcessing refund transaction...");
    const tx = await elaminter.refundWithdraw(withdrawTxId);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log("Refund processed successfully!");

    const ELACoin_ADDRESS = await elaminter._ELACoin();
    console.log(`ELACoin address: ${ELACoin_ADDRESS}`);
    const elacoin = await ethers.getContractAt("IELACoin", ELACoin_ADDRESS);
    const balance = await elacoin.balanceOf(targetAddress);
    console.log(`Balance of ${targetAddress}: ${balance}`);
    
  } catch (error) {
    console.error("Error processing refund:", error);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });