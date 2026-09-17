const hre = require("hardhat");

async function main() {
  const [client, freelancer, otherUser] = await hre.ethers.getSigners();

  console.log("========================================");
  console.log("        FreeLance3 - TABLE II");
  console.log("        Escrow Measurements");
  console.log("========================================\n");

  // Deploy the actual Escrow contract from the project
  const Escrow = await hre.ethers.getContractFactory("Escrow");

  const deployStart = process.hrtime.bigint();

  const escrow = await Escrow.deploy(
    freelancer.address,
    "TABLE-II-EVALUATION"
  );

  const deployTx = escrow.deploymentTransaction();
  const deployReceipt = await deployTx.wait();

  const deployEnd = process.hrtime.bigint();

  console.log("Contract deployed:");
  console.log("Address:", await escrow.getAddress());
  console.log("Deployment gas:", deployReceipt.gasUsed.toString());
  console.log(
    "Deployment time:",
    Number(deployEnd - deployStart) / 1e6,
    "ms"
  );

  // --------------------------------------------------
  // 1. ESCROW LOCK = deposit()
  // --------------------------------------------------

  const budget = hre.ethers.parseEther("1");

  const depositTx = await escrow.connect(client).deposit({
    value: budget
  });

  const depositReceipt = await depositTx.wait();

  console.log("\n=== ESCROW LOCK ===");
  console.log("deposit() gas:", depositReceipt.gasUsed.toString());

  // --------------------------------------------------
  // 2. ESCROW RELEASE = releaseMilestone(50)
  // --------------------------------------------------

  const releaseTx = await escrow
    .connect(client)
    .releaseMilestone(50);

  const releaseReceipt = await releaseTx.wait();

  console.log("\n=== ESCROW RELEASE ===");
  console.log(
    "releaseMilestone(50) gas:",
    releaseReceipt.gasUsed.toString()
  );

  // --------------------------------------------------
  // 3. Remaining 50% release
  // --------------------------------------------------

  const releaseTx2 = await escrow
    .connect(client)
    .releaseMilestone(50);

  const releaseReceipt2 = await releaseTx2.wait();

  console.log(
    "releaseMilestone(50) second call gas:",
    releaseReceipt2.gasUsed.toString()
  );

  // --------------------------------------------------
  // 4. Test a separate refund transaction
  // --------------------------------------------------

  const refundEscrow = await Escrow.deploy(
    freelancer.address,
    "REFUND-EVALUATION"
  );

  await refundEscrow.deploymentTransaction().wait();

  const refundDepositTx = await refundEscrow.connect(client).deposit({
    value: budget
  });

  await refundDepositTx.wait();

  const refundTx = await refundEscrow.connect(client).refund();
  const refundReceipt = await refundTx.wait();

  console.log("\n=== REFUND ===");
  console.log("refund() gas:", refundReceipt.gasUsed.toString());

  // --------------------------------------------------
  // 5. END-TO-END LOCAL ESCROW LIFECYCLE
  // --------------------------------------------------

  console.log("\n=== END-TO-END LOCAL LIFECYCLE ===");

  const lifecycleRuns = 5;
  const lifecycleTimes = [];

  for (let i = 0; i < lifecycleRuns; i++) {

    const lifecycleEscrow = await Escrow.deploy(
      freelancer.address,
      "LIFECYCLE-" + i
    );

    await lifecycleEscrow.deploymentTransaction().wait();

    const start = process.hrtime.bigint();

    // Lock funds
    const tx1 = await lifecycleEscrow.connect(client).deposit({
      value: budget
    });
    await tx1.wait();

    // Release first milestone
    const tx2 = await lifecycleEscrow
      .connect(client)
      .releaseMilestone(50);
    await tx2.wait();

    // Release remaining funds
    const tx3 = await lifecycleEscrow
      .connect(client)
      .releaseMilestone(50);
    await tx3.wait();

    const end = process.hrtime.bigint();

    const elapsedMs = Number(end - start) / 1e6;

    lifecycleTimes.push(elapsedMs);

    console.log(
      "Run",
      i + 1,
      ":",
      elapsedMs.toFixed(3),
      "ms"
    );
  }

  const average =
    lifecycleTimes.reduce((sum, value) => sum + value, 0) /
    lifecycleTimes.length;

  const minimum = Math.min(...lifecycleTimes);
  const maximum = Math.max(...lifecycleTimes);

  console.log("\nAverage lifecycle latency:", average.toFixed(3), "ms");
  console.log("Minimum:", minimum.toFixed(3), "ms");
  console.log("Maximum:", maximum.toFixed(3), "ms");

  console.log("\n========================================");
  console.log("             TABLE II VALUES");
  console.log("========================================");
  console.log(
    "Escrow lock gas:",
    depositReceipt.gasUsed.toString()
  );
  console.log(
    "Escrow release gas:",
    releaseReceipt.gasUsed.toString()
  );
  console.log(
    "Average lifecycle latency:",
    average.toFixed(3),
    "ms"
  );
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
