const { ethers, upgrades } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('>> deployer: ', deployer.address);

  // const OffchainBook = await ethers.getContractFactory('OffchainBook');
  // const offchainBook = await OffchainBook.deploy();
  // await offchainBook.deployed();

  const Endpoint = await ethers.getContractFactory('Endpoint');
  const endpoint = await upgrades.deployProxy(
    Endpoint,
    [
      '0xDFA3926296eaAc8E33c9798836Eae7e8CA1B02FB',
      '0xDFA3926296eaAc8E33c9798836Eae7e8CA1B02FB',
      '0xDFA3926296eaAc8E33c9798836Eae7e8CA1B02FB',
      '0xDFA3926296eaAc8E33c9798836Eae7e8CA1B02FB',
    ],
    {
      initializer: 'initialize',
      unsafeAllow: ['delegatecall'],
    }
  );
  await endpoint.deployed();

  console.log('>> endpoint: ', endpoint.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
