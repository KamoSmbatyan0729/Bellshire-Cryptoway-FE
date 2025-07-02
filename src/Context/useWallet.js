import { useEffect, useState } from "react";

function useWallet() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: "eth_accounts" })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

  return { account };
}

export default useWallet;
