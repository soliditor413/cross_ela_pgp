import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
require('hardhat-deploy')
import dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });

const { staging_key, prod_key } = process.env;
const mainNetURL = "https://api.elastos.io/esc";
const testnetURL = "https://api-testnet.elastos.io/esc";
const config: HardhatUserConfig = {
  networks: {
    prod: {
      url: mainNetURL,
      accounts: [...(prod_key ? [prod_key] : [])]
    },
    staging: {
      url: mainNetURL,
      accounts: [...(staging_key ? [staging_key] : [])]
    },
    testnet: {
      url: testnetURL,
      accounts: [...(staging_key ? [staging_key] : [])]
    },
    mainNet: {
      url: mainNetURL,
    },
    local: {
      url: "http://localhost:6111",
      accounts: [...(staging_key ? [staging_key] : [])]
    },

    hardhat: {
      chainId: 100,
      blockGasLimit: 8000000,
      accounts: [
        ...(staging_key ? [{ privateKey: staging_key, balance: "10000000000000000000000" }] : []),
      ],
    }
  },

  etherscan: {
    apiKey: {
      'testnet': 'empty',
      'mainNet': 'empty'
    },
    customChains: [
      {
        network: "testnet",
        chainId: 21,
        urls: {
          apiURL: "https://esc-testnet.elastos.io:443/api",
          browserURL: "https://esc-testnet.elastos.io:443"
        }
      },
      {
        network: "mainNet",
        chainId: 20,
        urls: {
          apiURL: "https://esc.elastos.io:443/api",
          browserURL: "https://esc.elastos.io:443"
        }
      },
    ]
  },

  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
};

export default config;
