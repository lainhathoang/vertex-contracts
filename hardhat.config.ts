/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-deploy";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "bsctest",
  networks: {
    hardhat: {},
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY || "import-key"],
    },
    mantleTest: {
      url: "https://rpc.testnet.mantle.xyz",
      accounts: [process.env.PRIVATE_KEY || "import-key"],
    },
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY || "import-key",
    customChains: [
      {
        network: "mantleTest",
        chainId: 5001,
        urls: {
          apiURL: "https://explorer.testnet.mantle.xyz/api",
          browserURL: "https://explorer.testnet.mantle.xyz",
        },
      },
    ],
  },
  contractSizer: {
    runOnCompile: true,
  },
  abiExporter: {
    path: "./abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  },
  gasReporter: {
    onlyCalledMethods: true,
    showTimeSpent: true,
  },
  mocha: {
    timeout: 1000000000,
  },
};

export default config;
