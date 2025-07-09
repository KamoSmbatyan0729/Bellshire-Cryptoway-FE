import { ethers } from "ethers";

// Set up the provider (Metamask injected provider)
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Get the signer (for write functions)
const signer = provider.getSigner();

// Define contract address and ABI
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractABI = [
  "function owner() public view returns (address)"
];

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, signer);
export default contract;