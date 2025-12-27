'use client';

/**
 * Reusable Wallet Status Component
 * @module components/WalletStatus
 *
 * Shows wallet connection status with consistent styling
 * Used throughout the app to display wallet state
 */

import { useWalletConnection } from '@/lib/hooks/useWalletConnection';

interface WalletStatusProps {
  className?: string;
  showMessage?: boolean;
}

export function WalletStatus({ className = '', showMessage = true }: WalletStatusProps) {
  const { isConnected, address } = useWalletConnection();

  if (!isConnected || !address) {
    return (
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <p className="text-sm text-blue-800">
          Please connect your wallet from the header to continue
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <p className="text-sm text-green-800">
        ✓ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
      </p>
    </div>
  );
}
