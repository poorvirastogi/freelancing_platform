const { expect } = require("chai");

describe("Table II - Escrow Correctness", function () {
  let Escrow;
  let escrow;
  let client;
  let freelancer;
  let otherUser;

  beforeEach(async function () {
    [client, freelancer, otherUser] = await ethers.getSigners();

    Escrow = await ethers.getContractFactory("Escrow");

    escrow = await Escrow.deploy(
      freelancer.address,
      "TEST-JOB"
    );

    await escrow.waitForDeployment();
  });

  // =========================
  // VALID TESTS
  // =========================

  it("TC01 - client can deposit", async function () {
    await expect(
      escrow.connect(client).deposit({
        value: ethers.parseEther("1")
      })
    ).to.not.be.reverted;
  });

  it("TC02 - balance is correct after deposit", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    expect(await escrow.getBalance())
      .to.equal(ethers.parseEther("1"));
  });

  it("TC03 - client can release milestone", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(client).releaseMilestone(50)
    ).to.not.be.reverted;
  });

  it("TC04 - client can release remaining milestone", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await escrow.connect(client).releaseMilestone(50);

    await expect(
      escrow.connect(client).releaseMilestone(50)
    ).to.not.be.reverted;
  });

  it("TC05 - client can refund", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(client).refund()
    ).to.not.be.reverted;
  });

  it("TC06 - status shows funded after deposit", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    const status = await escrow.getStatus();

    expect(status._isFunded).to.equal(true);
  });

  // =========================
  // INVALID INPUT TESTS
  // =========================

  it("TC07 - non-client cannot deposit", async function () {
    await expect(
      escrow.connect(otherUser).deposit({
        value: ethers.parseEther("1")
      })
    ).to.be.revertedWith("Only client can call this");
  });

  it("TC08 - zero deposit rejected", async function () {
    await expect(
      escrow.connect(client).deposit({
        value: 0
      })
    ).to.be.revertedWith("Must send ETH");
  });

  it("TC09 - double deposit rejected", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(client).deposit({
        value: ethers.parseEther("1")
      })
    ).to.be.revertedWith("Already funded");
  });

  it("TC10 - release before funding rejected", async function () {
    await expect(
      escrow.connect(client).releaseMilestone(50)
    ).to.be.revertedWith("Not funded yet");
  });

  it("TC11 - zero percentage rejected", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(client).releaseMilestone(0)
    ).to.be.revertedWith("Invalid percentage");
  });

  it("TC12 - percentage above 100 rejected", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(client).releaseMilestone(101)
    ).to.be.revertedWith("Invalid percentage");
  });

  it("TC13 - non-client cannot release", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(otherUser).releaseMilestone(50)
    ).to.be.revertedWith("Only client can call this");
  });

  it("TC14 - non-client cannot refund", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      escrow.connect(otherUser).refund()
    ).to.be.revertedWith("Only client can call this");
  });

  it("TC15 - refund cannot be called twice", async function () {
    await escrow.connect(client).deposit({
      value: ethers.parseEther("1")
    });

    await escrow.connect(client).refund();

    await expect(
      escrow.connect(client).refund()
    ).to.be.revertedWith("Already refunded");
  });
});
