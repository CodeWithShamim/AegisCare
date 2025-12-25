'use client'

/**
 * Web3 Provider Component
 * @module components/providers/Web3Provider
 *
 * Provides Wagmi context to the application
 * Wraps the app with Wagmi and React Query providers
 * Automatically switches wallet to Sepolia testnet
 */

import React, { useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { config } from '@/lib/web3config'

// Create React Query client
const queryClient = new QueryClient()

/**
 * Network Switcher Component
 * Automatically switches connected wallet to Sepolia testnet
 */
function NetworkSwitcher() {
  const { isConnected, chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  useEffect(() => {
    // Auto-switch to Sepolia when wallet connects and is on wrong network
    if (isConnected && chain?.id !== sepolia.id) {
      console.log('🔄 Auto-switching to Sepolia testnet...')
      switchChain({ chainId: sepolia.id })
        .then(() => {
          console.log('✅ Successfully switched to Sepolia testnet')
        })
        .catch((error) => {
          console.error('❌ Failed to switch network:', error)
        })
    }
  }, [isConnected, chain, switchChain])

  return null // This component doesn't render anything
}

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NetworkSwitcher />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
