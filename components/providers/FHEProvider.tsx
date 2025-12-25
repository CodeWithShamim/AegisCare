'use client'

/**
 * FHE Context Provider
 * @module components/providers/FHEProvider
 *
 * Provides FHE (Fully Homomorphic Encryption) context to the application
 * Initializes and manages the FHEVM instance using Zama's Relayer SDK
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initFHE, isFHEInitialized } from '@/lib/fheClient'
import { useAccount } from 'wagmi'

interface FHEContextType {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
  initFHE: () => Promise<void>
}

const FHEContext = createContext<FHEContextType | undefined>(undefined)

export function useFHE() {
  const context = useContext(FHEContext)
  if (!context) {
    throw new Error('useFHE must be used within FHEProvider')
  }
  return context
}

export function FHEProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useAccount()

  const initializeFHE = async () => {
    if (isInitializing || isInitialized) return

    setIsInitializing(true)
    setError(null)

    try {
      console.log('🔐 Initializing FHEVM...')
      await initFHE()
      setIsInitialized(true)
      console.log('✅ FHEVM initialized successfully')
    } catch (err: any) {
      console.error('❌ FHEVM initialization failed:', err)
      setError(err.message || 'Failed to initialize FHEVM')
    } finally {
      setIsInitializing(false)
    }
  }

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && !isInitialized && !isInitializing) {
      console.log('🔐 Wallet connected, initializing FHEVM...')
      initializeFHE()
    }
  }, [isConnected])

  // Also try to initialize on mount (if wallet already connected)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && !isInitialized) {
      console.log('🔐 Window.ethereum detected, initializing FHEVM...')
      initializeFHE()
    }
  }, [])

  return (
    <FHEContext.Provider
      value={{
        isInitialized,
        isInitializing,
        error,
        initFHE: initializeFHE,
      }}
    >
      {children}
    </FHEContext.Provider>
  )
}
