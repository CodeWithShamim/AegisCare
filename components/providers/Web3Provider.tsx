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

// Create React Query client (client-side only)
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return makeQueryClient()
  } else {
    // Browser: create a new QueryClient if needed
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**
 * Network Switcher Component
 * Automatically switches connected wallet to Sepolia testnet
 */
function NetworkSwitcher() {
  const { isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    // Auto-switch to Sepolia when wallet connects and is on wrong network
    if (isConnected && chain?.id !== sepolia.id) {
      console.log('🔄 Auto-switching to Sepolia testnet...')
      switchChain({ chainId: sepolia.id })
      console.log('✅ Network switch initiated')
    }
  }, [isConnected, chain, switchChain])

  return null // This component doesn't render anything
}

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NetworkSwitcher />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
