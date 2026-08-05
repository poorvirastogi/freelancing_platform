const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Escrow contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    deployer.address,
    "test-job-123"
  );

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});