import { ethers } from "ethers";
import ERC20ABI from "./abis/ERC20Abi.json"; // Must include approve()

const approveTokens = async (spenderAddress, approveAmount) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tokenContract = new ethers.Contract(
    process.env.REACT_APP_PROXY_TOKEN_CONTRACT_ADDRESS,
    ERC20ABI,
    signer
  );

  const spender = spenderAddress; // Contract or user allowed to spend
  const amount = ethers.utils.parseEther(approveAmount.toString()); // Approve 100 tokens (18 decimals)

  const tx = await tokenContract.approve(spender, amount);
  await tx.wait();

};
export default approveTokens;
