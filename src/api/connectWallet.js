import axios from "axios";
export async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { wallet_address: accounts[0]},
        config
      );
      return {userData: data, account: accounts[0]};
    } catch (error) {
      throw new Error("User rejected connection");
    }
  } else {
    throw new Error("Please install MetaMask");
  }
}
