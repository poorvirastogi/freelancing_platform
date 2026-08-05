import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    const a = localStorage.getItem("account");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      setAccount(a);
    }

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          handleDisconnect();
        } else {
          // User switched account — force logout and re-login
          handleDisconnect();
          alert("Account switched in MetaMask. Please connect again.");
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const saveSession = (token, user, account) => {
    setToken(token);
    setUser(user);
    setAccount(account);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("account", account);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("account");
  };

  const connectWallet = async (role) => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return { success: false };
      }

      // Switch to Sepolia first
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/rMDsD5hgSTpz7QpBjaWd0"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        }
      }

      // Get currently selected account from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Get nonce
      const { data: nonceData } = await axios.get(`${API}/auth/nonce/${address}`);

      // Sign message
      const message = `Welcome to FreeLance3!\n\nPlease sign this message to verify your wallet.\n\nNonce: ${nonceData.nonce}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Verify — pass role so backend knows which portal
      const { data } = await axios.post(`${API}/auth/verify`, {
        walletAddress: address,
        signature,
        role,
      });

      saveSession(data.token, data.user, address);
      return { success: true, user: data.user };

    } catch (error) {
      console.error("Login failed:", error);

      // Handle role mismatch specifically
      if (error.response?.status === 403) {
        const correctRole = error.response?.data?.correctRole;
        const msg = error.response?.data?.error;
        alert(`⚠️ ${msg}\n\nPlease go to the ${correctRole} portal instead.`);
        return { success: false, wrongPortal: true, correctRole };
      }

      alert("Login failed: " + (error.response?.data?.error || error.message));
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    handleDisconnect();
  };

  return (
    <WalletContext.Provider value={{
      account, token, user, loading,
      connectWallet, disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
