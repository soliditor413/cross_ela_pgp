import { ethers, network } from "hardhat";
import { readConfig } from "./helper";
// Configuration


async function main() {
  console.log(`Calling Recharge on ${network.name} network...`);
  const ELAMINTER_ADDRESS = await readConfig(network.name, "elaminter"); // Replace with your deployed ELAMinter contract address
  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log(`Using account: ${signer.address}`);

    // Get contract instance with signer
    const ELAMINTER = await ethers.getContractFactory("ELAMinter");
    const elaminter = await ELAMINTER.connect(signer).attach(ELAMINTER_ADDRESS);
    
    // Get the gas price
    const gasPrice = await signer.provider?.getFeeData();
    const gasPriceToUse = gasPrice?.gasPrice || ethers.utils.parseUnits("500", "gwei");
    
    console.log(`Using gas price: ${ethers.utils.formatUnits(gasPriceToUse, 'gwei')} gwei`);
    
    const withdrawAmount = ethers.utils.parseUnits("0.001", "8");
    const withdrawFee = ethers.utils.parseUnits("0.0001", "8");
    const targetAddress = "EPyWeXwnxqA6MnqmkZ28wSo5rJuq77FsaM";
    console.log(`Using withdraw amount: ${withdrawAmount}`);
    console.log(`Using withdraw fee: ${withdrawFee}`);
    console.log(`Using target address: ${targetAddress}`);
    
    const gasLimt = await elaminter.estimateGas.withdraw(targetAddress, withdrawAmount, withdrawFee);
    console.log(`Using gas limit: ${gasLimt}`);
    // Call the Recharge function with parameters
    const tx = await elaminter.withdraw(targetAddress, withdrawAmount, withdrawFee, {
      gasPrice: gasPriceToUse,
      gasLimit: gasLimt
    });
    
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed in block: ${receipt?.blockNumber}`);
    if (receipt) {
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    }
    console.log("Recharge completed successfully!");
    await verifiyBalance();
    
  } catch (error) {
    console.error("Error calling Recharge:", error);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
}

async function verifiyBalance() {
  const ELAMINTER_ADDRESS = await readConfig(network.name, "elaminter"); // Replace with your deployed ELAMinter contract address
  const elaminter = await ethers.getContractAt("ELAMinter", ELAMINTER_ADDRESS);
  const ELACoin_ADDRESS = await elaminter.elaCoin();
  console.log(`ELACoin address: ${ELACoin_ADDRESS}`);
  const elacoin = await ethers.getContractAt("IELACoin", ELACoin_ADDRESS);
  
  for (let i = 0; i < 10; i++) {
    let address ="0x000000000000000000000000000000000000000" + i.toString(16);
    console.log(`Verifying balance of ${address}`);
    const balance = await elacoin.balanceOf(address);
    console.log(`Balance of ${address}: ${balance}`);
    
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });