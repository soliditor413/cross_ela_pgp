import { ethers, network } from "hardhat";
import { readConfig } from "./helper";

async function verifiyBalance() {
  const ELAMINTER_ADDRESS = await readConfig(network.name, "elaminter"); // Replace with your deployed ELAMinter contract address
  console.log(`ELAMINTER_ADDRESS`, ELAMINTER_ADDRESS);
  const elaminter = await ethers.getContractAt("ELAMinter", ELAMINTER_ADDRESS);
  console.log(`elaminter`, elaminter.address);
  const ELACoin_ADDRESS = await elaminter.ELACoin();
  console.log(`ELACoin address: ${ELACoin_ADDRESS}`);
  const elacoin = await ethers.getContractAt("IELACoin", ELACoin_ADDRESS);
  
  for (let i = 0; i < 10; i++) {
    let address ="0x000000000000000000000000000000000000000" + (i+1).toString(16);
    console.log(`Verifying balance of ${address}`);
    const balance = await elacoin.balanceOf(address);
    console.log(`Balance of ${address}: ${balance}`);
    
  }
}

verifiyBalance();