import { ethers } from 'ethers';
import contractABI from './abis/BellshireProxy.json'; // copy ABI to src/abis

const contractAddress = process.env.REACT_APP_PROXY_CONTRACT_ADDRESS;

export const getContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI.abi, signer);
};
