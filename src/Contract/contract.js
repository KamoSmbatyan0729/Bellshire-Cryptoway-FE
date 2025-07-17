const Web3 = require('web3');
import contractABI from './abis/BellshireProxy.json'; // copy ABI to src/abis

const contractAddress = process.env.REACT_APP_PROXY_CONTRACT_ADDRESS;

export const getContract = () => {
  if (!window.ethereum) {
    console.error("MetaMask not detected (window.ethereum is undefined)");
    return null;
  }
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(contractABI.abi, contractAddress);
};
