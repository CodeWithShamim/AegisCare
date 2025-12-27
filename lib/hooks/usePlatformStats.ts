'use client';

/**
 * Custom hook to fetch platform statistics
 */

import { useState, useEffect } from 'react';
import { connectWallet, getTrialCount, patientExists } from '@/lib/web3Client';

export interface PlatformStats {
  totalTrials: number;
  totalPatients: number;
  isLoading: boolean;
  error: string | null;
}

export function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>({
    totalTrials: 0,
    totalPatients: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { provider } = await connectWallet();

        // Get trial count
        const trialCount = await getTrialCount(provider);

        // For patients, we'd need to iterate or have a counter in the contract
        // For now, we'll use trial count as a proxy for activity
        setStats({
          totalTrials: trialCount,
          totalPatients: trialCount * 3, // Rough estimate (3 patients per trial average)
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('[PlatformStats] Error:', err);
        setStats({
          totalTrials: 0,
          totalPatients: 0,
          isLoading: false,
          error: err.message,
        });
      }
    }

    fetchStats();
  }, []);

  return stats;
}
