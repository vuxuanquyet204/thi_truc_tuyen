// Wallet hook - placeholder implementation for blockchain feature
// Provides wallet connection state and operations

import { useState, useCallback } from 'react';
import type { WalletInfo as BlockchainWalletInfo } from '@/features/blockchain/services';

export interface WalletInfo extends BlockchainWalletInfo {
  // Extended wallet info for UI state
}

export interface UseWalletReturn {
  wallet: WalletInfo | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (type: 'metamask' | 'walletconnect' | 'email') => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  const isConnected = wallet?.address != null;

  const connect = useCallback(async (type: 'metamask' | 'walletconnect' | 'email') => {
    setIsConnecting(true);
    setError(null);
    try {
      console.log('Wallet connect called with type:', type);
      // Placeholder - no wallet connected in stub
      setWallet(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    console.log('Switch network to chainId:', chainId);
  }, []);

  return {
    wallet,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
  };
}

export default useWallet;
