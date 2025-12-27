'use client';

import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { config } from '@/lib/web3config';

// Create React Query client
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function NetworkSwitcher() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chain?.id !== sepolia.id) {
      console.log('🔄 Auto-switching to Sepolia testnet...');
      switchChain({ chainId: sepolia.id });
      console.log('✅ Network switch initiated');
    }
  }, [isConnected, chain, switchChain]);

  return null; // This component doesn't render anything
}

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NetworkSwitcher />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
