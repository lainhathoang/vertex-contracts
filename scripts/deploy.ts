import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(">> deployer: ", deployer.address);

  // "quote" => USDC
  // "sanactions"?, "sequencer"?, get price with oracle?

  // const OffchainBook = await ethers.getContractFactory('OffchainBook');
  // const offchainBook = await upgrades.deployProxy(OffchainBook);
  // await offchainBook.deployed();

  // FEE CALCULATOR
  const FeeCalculator = await ethers.getContractFactory("FeeCalculator");
  const feeCalculator = await FeeCalculator.deploy();
  await feeCalculator.deployed();
  // ========================

  // CLEARING HOUSE LIQ
  const ClearinghouseLiq = await ethers.getContractFactory("ClearinghouseLiq");
  const clearinghouseLiq = await ClearinghouseLiq.deploy();
  await clearinghouseLiq.deployed();
  // ========================

  // CLEARING HOUSE
  const Clearinghouse = await ethers.getContractFactory("Clearinghouse");
  const clearinghouse = await upgrades.deployProxy(
    Clearinghouse,
    [
      "0x0000000000000000000000000000000000000000", // endpoint -> 'll set later
      "0x0000000000000000000000000000000000000000", // quote ??? -> USDC
      feeCalculator.address,
      clearinghouseLiq.address,
    ],
    {
      initializer: "initialize",
      unsafeAllow: ["delegatecall"],
    }
  );
  await clearinghouse.deployed();
  // ========================

  // ENDPOINT
  const Endpoint = await ethers.getContractFactory("Endpoint");
  const endpoint = await upgrades.deployProxy(Endpoint, [
    "0x0000000000000000000000000000000000000000", // sanactions address,
    "0x0000000000000000000000000000000000000000", // sequencer address,
    clearinghouse.address, // clearinghouse address
    72000, // slowModeTimeout - if place order with CLOB failed -> AMM
    0, // time {perpTime, spotTime}??
    [4, 3, 32, 22, 12, 222], // price[a-spot, a-perp, b-spot, b-perp, ...] -> healthGroup
  ]);
  await endpoint.deployed();
  // set endpoint for clearing house
  await clearinghouse.setEndpoint(endpoint.address);
  // ========================

  // SPOT ENGINE
  const SpotEngine = await ethers.getContractFactory("SpotEngine");
  const spotEngine = await upgrades.deployProxy(SpotEngine, [
    clearinghouse.address, // clearinghouse address
    "0x0000000000000000000000000000000000000000", // quote address
    endpoint.address, // endpoint address
    deployer.address, // admin address
    feeCalculator.address,
  ]);
  await spotEngine.deployed();
  // ========================

  // PERP ENGINE
  const PerpEngine = await ethers.getContractFactory("PerpEngine");
  const perpEngine = await upgrades.deployProxy(PerpEngine, [
    clearinghouse.address, // clearinghouse address
    "0x0000000000000000000000000000000000000000", // quote address
    endpoint.address, // endpoint address
    deployer.address, // admin address
    feeCalculator.address,
  ]);
  await perpEngine.deployed();
  // ========================

  console.log("Addresses");
  console.log(">> FeeCalculator: ", feeCalculator.address);
  console.log(">> ClearinghouseLiq: ", clearinghouseLiq.address);
  console.log(">> Clearinghouse: ", clearinghouse.address);
  console.log(">> Endpoint: ", endpoint.address);
  console.log(">> SpotEngine: ", spotEngine.address);
  console.log(">> PerpEngine: ", perpEngine.address);
  // console.log(">> OffchainBook: ", offchainBook.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
