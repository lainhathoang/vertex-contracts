// const { ethers, upgrades } = require("hardhat");
import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(">> deployer: ", deployer.address);

  // const OffchainBook = await ethers.getContractFactory('OffchainBook');
  // const offchainBook = await upgrades.deployProxy(OffchainBook);
  // await offchainBook.deployed();

  const FeeCalculator = await ethers.getContractFactory("FeeCalculator");
  const feeCalculator = await FeeCalculator.deploy();
  await feeCalculator.deployed();

  const ClearinghouseLiq = await ethers.getContractFactory("ClearinghouseLiq");
  const clearinghouseLiq = await ClearinghouseLiq.deploy();
  await clearinghouseLiq.deployed();

  const Clearinghouse = await ethers.getContractFactory("Clearinghouse");
  const clearinghouse = await upgrades.deployProxy(
    Clearinghouse,
    [
      // "", // endpoint
      // "", // quote ???
      feeCalculator.address, // xx
      feeCalculator.address, // xx
      feeCalculator.address,
      clearinghouseLiq.address,
    ],
    {
      initializer: "initialize",
      unsafeAllow: ["delegatecall"],
    }
  );
  await clearinghouse.deployed();

  const Endpoint = await ethers.getContractFactory("Endpoint");
  const endpoint = await upgrades.deployProxy(Endpoint, [
    "", // sanactions address,
    "", // sequencer address,
    clearinghouse.address, // clearinghouse address
    72000, // slowModeTimeout
    0, // time {perpTime, spotTime}??
    [], // price[a-spot, a-perp, b-spot, b-perp, ...]
  ]);
  await endpoint.deployed();

  const SpotEngine = await ethers.getContractFactory("SpotEngine");
  const spotEngine = await upgrades.deployProxy(SpotEngine, [
    clearinghouse.address, // clearinghouse address
    "", // quote address
    endpoint.address, // endpoint address
    "", // admin address
    feeCalculator.address,
  ]);
  await spotEngine.deployed();

  const PerpEngine = await ethers.getContractFactory("PerpEngine");
  const perpEngine = await upgrades.deployProxy(PerpEngine, [
    clearinghouse.address, // clearinghouse address
    "", // quote address
    endpoint.address, // endpoint address
    "", // admin address
    feeCalculator.address,
  ]);
  await perpEngine.deployed();

  console.log("Address");
  console.log(">> FeeCalculator: ", feeCalculator.address);
  console.log(">> ClearinghouseLiq: ", clearinghouseLiq.address);
  console.log(">> Clearinghouse: ", clearinghouse.address);
  console.log(">> Endpoint: ", endpoint.address);
  console.log(">> SpotEngine: ", spotEngine.address);
  console.log(">> SpotEngine: ", perpEngine.address);
  // console.log(">> OffchainBook: ", offchainBook.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
