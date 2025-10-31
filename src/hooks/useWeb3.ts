import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface Web3State {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface Web3Actions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToPolygon: () => Promise<void>;
  switchToAmoy: () => Promise<void>;
  switchToHardhat: () => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWeb3 = (): Web3State & Web3Actions => {
  const [state, setState] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Polygon network configurations
  const POLYGON_MAINNET = {
    chainId: "0x89", // 137
    chainName: "Polygon Mainnet",
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  };

  const AMOY_TESTNET = {
    chainId: "0x13882", // 80002
    chainName: "Polygon Amoy",
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  };

  const HARDHAT_LOCAL = {
    chainId: "0x539", // 1337
    chainName: "Hardhat Local",
    rpcUrls: ["http://localhost:8545"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  };

  const connect = useCallback(async () => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (typeof window === "undefined") {
      setState((prev) => ({ ...prev, error: "Браузер недоступен" }));
      return;
    }

    // Check for ethereum provider - improved mobile detection
    if (!window.ethereum) {
      if (isMobile) {
        setState((prev) => ({ 
          ...prev, 
          error: "Установите MetaMask или откройте в браузере MetaMask" 
        }));
        // Try to redirect to MetaMask download on mobile
        setTimeout(() => {
          if (confirm("MetaMask не найден. Открыть страницу загрузки?")) {
            window.open("https://metamask.io/download/", "_blank");
          }
        }, 100);
      } else {
        setState((prev) => ({ ...prev, error: "MetaMask не установлен" }));
      }
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // For mobile, use direct window.ethereum.request for better compatibility
      let accounts: string[] = [];
      let provider: ethers.BrowserProvider;
      
      if (isMobile) {
        // Mobile-specific connection flow
        try {
          // First, try direct ethereum request (works better on mobile MetaMask)
          accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
          }) as string[];
          
          if (!accounts || accounts.length === 0) {
            throw new Error("Аккаунты не найдены. Разблокируйте MetaMask.");
          }
          
          // Create provider after accounts are available
          provider = new ethers.BrowserProvider(window.ethereum);
        } catch {
          // If direct request fails, try through provider
          provider = new ethers.BrowserProvider(window.ethereum);
          
          try {
            accounts = await provider.send("eth_requestAccounts", []) as string[];
          } catch (providerError: any) {
            if (providerError.code === 4001) {
              throw new Error("Подключение отклонено пользователем");
            }
            throw providerError;
          }
        }
      } else {
        // Desktop flow
        provider = new ethers.BrowserProvider(window.ethereum);
        accounts = await provider.send("eth_requestAccounts", []) as string[];
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error("Не найдено активных аккаунтов");
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setState({
        account: accounts[0],
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      
      let errorMessage = "Не удалось подключить кошелёк. Попробуйте снова.";
      
      if (error.code === 4001) {
        errorMessage = "Подключение отклонено";
      } else if (error.code === -32002) {
        errorMessage = "Запрос уже обрабатывается. Проверьте MetaMask.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchToPolygon = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_MAINNET.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [POLYGON_MAINNET],
        });
      }
    }
  }, []);

  const switchToAmoy = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_TESTNET.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_TESTNET],
        });
      }
    }
  }, []);

  const switchToHardhat = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_LOCAL.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [HARDHAT_LOCAL],
        });
      }
    }
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();

          setState({
            account: accounts[0],
            provider,
            signer,
            chainId: Number(network.chainId),
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState((prev) => ({ ...prev, account: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState((prev) => ({ ...prev, chainId: parseInt(chainId, 16) }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    switchToPolygon,
    switchToAmoy,
    switchToHardhat,
  };
};
