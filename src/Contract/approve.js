import ERC20ABI from "./abis/ERC20Abi.json"; // Must include approve()
const Web3 = require('web3');

const approveTokens = async (spenderAddress, approveAmount) => {
  if (!window.ethereum) {
    console.error("MetaMask not detected (window.ethereum is undefined)");
    return null;
  }

  const web3 = new Web3(window.ethereum);

  const accounts = await web3.eth.requestAccounts();
  const sender = accounts[0];

  const tokenContract = new web3.eth.Contract(
    ERC20ABI,
    process.env.REACT_APP_PROXY_TOKEN_CONTRACT_ADDRESS
  );

  const spender = spenderAddress; // Contract or user allowed to spend
  const amount = web3.utils.toWei(approveAmount.toString(), "ether"); // Approve 100 tokens (18 decimals)  

  const tx = await tokenContract.methods.approve(spender, amount).send({ from: sender,  gas: 200000})
  .on("receipt", function (receipt) {
    console.log("Approval confirmed!", receipt);
  })
  .on("error", function (error) {
    console.error("Approval failed:", error);
  });
};
export default approveTokens;
