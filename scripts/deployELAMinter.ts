import { ethers, network } from "hardhat";
import { writeConfig } from "./helper";

async function main() {
  console.log(`Starting deployment to ${network.name} network...`);

  try {
    // Get the deployer account and provider
    const [deployer] = await ethers.getSigners();
    const provider = ethers.provider;
    
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    
    // Get balance using provider
    const balance = await provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

    console.log("Deploying ELAMinter contract...");
    
    // Deploy ELAMinter contract with simplified deployment
    const ELAMinter = await ethers.getContractFactory("ELAMinter");
    
    // Simple deployment without custom gas settings
    const elaminter = await ELAMinter.deploy({
      gasPrice: ethers.utils.parseUnits("500", "gwei"),
      gasLimit: 8000000
    });
    
    console.log("Waiting for deployment confirmation...");
    const deploymentReceipt = await elaminter.deployTransaction.wait();
    const address = elaminter.address;
    
    console.log(`ELAMinter deployed to: ${address}`);
    await writeConfig(network.name, network.name, "elaminter", address);
    
    // Log deployment details
    console.log("\nDeployment Summary:");
    console.log("==================");
    console.log(`Contract: ELAMinter`);
    console.log(`Network: ${network.name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Deployed at: ${address}`);
    console.log(`Transaction Hash: ${deploymentReceipt.transactionHash}`);
    console.log("\nDeployment completed successfully!");
    
    // Manual verification instructions
    console.log("\nTo verify your contract on the block explorer, run:");
    console.log(`npx hardhat verify --network ${network.name} ${address}`);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });