'use client'

/**
 * Wallet Connect Button Component
 * @module components/WalletButton
 *
 * Professional wallet connection UI with:
 * - Connect/Disconnect functionality
 * - Address display with copy button
 * - Network indicator with auto-switch to Sepolia
 * - Balance display
 * - Network switching status
 */

import React from 'react'
import { useAccount, useDisconnect, useBalance, useConnect, useSwitchChain } from 'wagmi'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { sepolia } from 'wagmi/chains'

export function WalletButton() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { data: balance } = useBalance({
    address: address
  })

  const [copied, setCopied] = React.useState(false)

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Format balance
  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00'
    return (Number(balance) / 1e18).toFixed(4)
  }

  // Handle connect with fallback to injected
  const handleConnect = () => {
    connect({ connector: injected() })
  }

  // Manual network switch
  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={handleConnect}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Connect Wallet
      </button>
    )
  }

  const isWrongNetwork = chain?.id !== sepolia.id

  return (
    <div className="flex items-center space-x-3">
      {/* Network Indicator */}
      {chain && (
        <div className={`hidden sm:flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isWrongNetwork
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {isSwitchingChain ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Switching...
            </>
          ) : (
            <>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                chain.id === 31337 ? 'bg-green-500' :
                chain.id === 1 ? 'bg-blue-500' :
                chain.id === 11155111 ? 'bg-purple-500' :
                'bg-gray-500'
              }`} />
              {chain.name}
              {isWrongNetwork && (
                <button
                  onClick={handleSwitchToSepolia}
                  className="ml-2 px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                  title="Switch to Sepolia"
                >
                  Switch
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Balance Display */}
      {balance && (
        <div className="hidden md:flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
          {formatBalance(balance.value)} {balance.symbol}
        </div>
      )}

      {/* Address Display with Copy */}
      <div className="flex items-center space-x-2">
        <button
          onClick={copyAddress}
          className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-colors ${
            isWrongNetwork
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
              : 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
          }`}
          title="Click to copy address"
        >
          {formatAddress(address)}
          {copied ? (
            <svg className="w-4 h-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          title="Disconnect"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  )
}
