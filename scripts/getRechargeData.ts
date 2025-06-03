import { ethers, network } from "hardhat";
import { readConfig } from "./helper";
// Configuration

const ELA_HASH = "0xc4a3d5dc09808adb4e01fa805f722c3c34f41ca57496c299d17b5e0477b2b056"; // Replace with your actual ELA hash

async function main() {
  console.log(`Calling Recharge on ${network.name} network...`);
  const ELAMINTER_ADDRESS = await readConfig(network.name, "elaminter"); // Replace with your deployed ELAMinter contract address
  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log(`Using account: ${signer.address}`);

    // Get contract instance with signer
    const elaminter = await ethers.getContractAt("ELAMinter", ELAMINTER_ADDRESS, signer);
    
    console.log(`Calling Recharge with hash: ${ELA_HASH}`);
    
    // Get the gas price
    const gasPrice = await signer.provider?.getFeeData();
    const gasPriceToUse = gasPrice?.gasPrice || ethers.parseUnits("500", "gwei");
    
    // Prepare transaction parameters
    const txParams = {
      gasPrice: gasPriceToUse,
      // You can set a custom gas limit if needed
      gasLimit: 8000000  // Adjust this value based on your needs
    };
    
    console.log(`Using gas price: ${ethers.formatUnits(gasPriceToUse, 'gwei')} gwei`);
    
    // Call the Recharge function with parameters
    const tx = await elaminter.getRechargeData(ELA_HASH);
    console.log(`data len: ${tx.length}`);
    console.log(`Transaction hash: ${tx}`);
    console.log("Waiting for transaction confirmation...");
    
  } catch (error) {
    console.error("Error calling Recharge:", error);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });