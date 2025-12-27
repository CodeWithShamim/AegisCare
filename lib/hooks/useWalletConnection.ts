'use client';

/**
 * Reusable Wallet Connection Hook
 * @module lib/hooks/useWalletConnection
 *
 * Provides wallet state and utilities for components
 * Uses Wagmi under the hood for consistent wallet management
 */

import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | undefined;
  isConnecting: boolean;
  error: string | null;
}

export function useWalletConnection() {
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Clear errors when connection succeeds
  useEffect(() => {
    if (isConnected) {
      setError(null);
      setIsConnecting(false);
    }
  }, [isConnected]);

  return {
    isConnected,
    address,
    isConnecting: status === 'connecting' || status === 'reconnecting' || isConnecting,
    error,
    setError,
    disconnect,
  };
}
