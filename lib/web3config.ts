/**
 * Web3Modal Configuration
 * @module lib/web3config
 *
 * Professional wallet connection setup using Web3Modal + Wagmi
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and more
 */

import { http, createConfig } from 'wagmi'
import { hardhat, mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi/react'

// Get WalletConnect Project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Metadata for your dApp
export const metadata = {
  name: 'AegisCare',
  description: 'Privacy-Preserving Clinical Trial Matching using FHE',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: ['/favicon.ico']
}

// Wagmi configuration
export const config = createConfig({
  chains: [hardhat, mainnet, sepolia],
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    // Use reliable public RPC for Sepolia to support FHE operations
    [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia')
  },
  ssr: true
})

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false
})

// Export chains for use in components
export { hardhat, mainnet, sepolia }
