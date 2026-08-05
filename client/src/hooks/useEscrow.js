import { ethers } from "ethers";
import EscrowABI from "../utils/EscrowABI";

export const useEscrow = () => {
  // Deploy a new escrow contract for a job
  const deployEscrow = async (freelancerAddress, jobId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // We need the contract bytecode to deploy
    // For now we'll use a factory pattern
    const escrowFactory = new ethers.ContractFactory(
      EscrowABI,
      // Bytecode from compiled contract
      await getBytecode(),
      signer
    );

    const escrow = await escrowFactory.deploy(freelancerAddress, jobId);
    await escrow.waitForDeployment();
    return await escrow.getAddress();
  };

  // Connect to existing escrow contract
  const getEscrowContract = async (escrowAddress) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(escrowAddress, EscrowABI, signer);
  };

  // Deposit ETH into escrow
  const depositToEscrow = async (escrowAddress, amountInEth) => {
    const contract = await getEscrowContract(escrowAddress);
    const tx = await contract.deposit({
      value: ethers.parseEther(amountInEth.toString()),
    });
    await tx.wait();
    return tx;
  };

  // Release payment to freelancer
  const releasePayment = async (escrowAddress) => {
    const contract = await getEscrowContract(escrowAddress);
    const tx = await contract.release();
    await tx.wait();
    return tx;
  };

  // Refund client
  const refundClient = async (escrowAddress) => {
    const contract = await getEscrowContract(escrowAddress);
    const tx = await contract.refund();
    await tx.wait();
    return tx;
  };

  // Get escrow status
  const getEscrowStatus = async (escrowAddress) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(escrowAddress, EscrowABI, provider);
    const status = await contract.getStatus();
    return {
      client: status[0],
      freelancer: status[1],
      amount: ethers.formatEther(status[2]),
      isFunded: status[3],
      isCompleted: status[4],
      isRefunded: status[5],
    };
  };

  return {
    deployEscrow,
    depositToEscrow,
    releasePayment,
    refundClient,
    getEscrowStatus,
  };
};