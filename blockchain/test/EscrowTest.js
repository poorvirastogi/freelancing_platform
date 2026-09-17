const { expect } = require("chai");
const { ethers } = require("hardhat");
const { performance } = require("perf_hooks");

describe("FreeLance3 - Full Evaluation Suite", function () {
  let escrow, owner, client, freelancer, attacker;
  const jobId = "job_test_001";
  const budget = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, client, freelancer, attacker] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.connect(client).deploy(freelancer.address, jobId);
    await escrow.waitForDeployment();
  });

  // ── VALID CASES ──────────────────────────────────────────────

  it("TC01: Client can deposit funds into escrow", async function () {
    const tx = await escrow.connect(client).deposit({ value: budget });
    await tx.wait();
    const bal = await escrow.getBalance();
    expect(bal).to.equal(budget);
  });

  it("TC02: Client can release partial milestone payment", async function () {
    await escrow.connect(client).deposit({ value: budget });
    const freelancerBefore = await ethers.provider.getBalance(freelancer.address);
    const tx = await escrow.connect(client).releasePartial(50);
    await tx.wait();
    const freelancerAfter = await ethers.provider.getBalance(freelancer.address);
    expect(freelancerAfter).to.be.gt(freelancerBefore);
  });

  it("TC03: Client can release all remaining funds", async function () {
    await escrow.connect(client).deposit({ value: budget });
    const tx = await escrow.connect(client).releaseAll();
    await tx.wait();
    const bal = await escrow.getBalance();
    expect(bal).to.equal(0);
  });

  it("TC04: Client can refund remaining balance", async function () {
    await escrow.connect(client).deposit({ value: budget });
    const clientBefore = await ethers.provider.getBalance(client.address);
    const tx = await escrow.connect(client).refund();
    await tx.wait();
    const clientAfter = await ethers.provider.getBalance(client.address);
    expect(clientAfter).to.be.gt(clientBefore);
  });

  it("TC05: getStatus returns correct state after deposit", async function () {
    await escrow.connect(client).deposit({ value: budget });
    const status = await escrow.getStatus();
    expect(status[3]).to.equal(true);  // isFunded
    expect(status[4]).to.equal(false); // isCompleted
  });

  it("TC06: getBalance returns correct amount", async function () {
    await escrow.connect(client).deposit({ value: budget });
    expect(await escrow.getBalance()).to.equal(budget);
  });

  it("TC07: Full lifecycle - deposit + partial + releaseAll", async function () {
    const start = performance.now();
    await escrow.connect(client).deposit({ value: budget });
    await escrow.connect(client).releasePartial(30);
    await escrow.connect(client).releasePartial(30);
    await escrow.connect(client).releaseAll();
    const end = performance.now();
    console.log(`\n  ⏱  Full lifecycle latency: ${(end - start).toFixed(2)} ms`);
    expect(await escrow.getBalance()).to.equal(0);
  });

  // ── ADVERSARIAL / INVALID CASES ──────────────────────────────

  it("TC08 [ADVERSARIAL]: Non-client cannot deposit", async function () {
    await expect(
      escrow.connect(attacker).deposit({ value: budget })
    ).to.be.revertedWith("Only client");
  });

  it("TC09 [ADVERSARIAL]: Non-client cannot release funds", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await expect(
      escrow.connect(attacker).releaseAll()
    ).to.be.revertedWith("Only client");
  });

  it("TC10 [ADVERSARIAL]: Cannot release before funding", async function () {
    await expect(
      escrow.connect(client).releaseAll()
    ).to.be.revertedWith("Not funded");
  });

  it("TC11 [ADVERSARIAL]: Cannot deposit twice", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await expect(
      escrow.connect(client).deposit({ value: budget })
    ).to.be.revertedWith("Already funded");
  });

  it("TC12 [ADVERSARIAL]: Cannot refund after completion", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await escrow.connect(client).releaseAll();
    await expect(
      escrow.connect(client).refund()
    ).to.be.revertedWith("Already finalized");
  });

  it("TC13 [ADVERSARIAL]: Cannot release after refund", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await escrow.connect(client).refund();
    await expect(
      escrow.connect(client).releaseAll()
    ).to.be.revertedWith("Already finalized");
  });

  it("TC14 [ADVERSARIAL]: Invalid percentage 0 reverts", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await expect(
      escrow.connect(client).releasePartial(0)
    ).to.be.revertedWith("Bad percentage");
  });

  it("TC15 [ADVERSARIAL]: Invalid percentage >100 reverts", async function () {
    await escrow.connect(client).deposit({ value: budget });
    await expect(
      escrow.connect(client).releasePartial(101)
    ).to.be.revertedWith("Bad percentage");
  });
});
