import React, { createContext, useContext, useEffect, useState } from 'react';
import { blockchainService, BlockchainState } from '@/lib/blockchain';
import { useToast } from '@/hooks/use-toast';

interface BlockchainContextType extends BlockchainState {
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BlockchainState>(blockchainService.getState());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const result = await blockchainService.connectWallet();
      
      if (result.success) {
        setState(blockchainService.getState());
        toast({
          title: "Wallet Connected! 🎉",
          description: `Connected to ${result.address}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    // Reset state
    setState({
      provider: null,
      signer: null,
      contracts: {
        certAgency: null,
        certifier: null,
        certTemplate: null,
        receiver: null,
        certificates: null
      },
      address: null,
      isConnected: false,
      isAuthorized: false,
      userRole: null
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from the blockchain",
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== state.address) {
          // Account changed, reconnect
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.address]);

  const contextValue: BlockchainContextType = {
    ...state,
    connectWallet,
    disconnect,
    isLoading
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}
