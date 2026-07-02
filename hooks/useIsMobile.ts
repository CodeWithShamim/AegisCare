'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is below the single `md` (768px) breakpoint used
 * across the AegisCare landing redesign.
 *
 * SSR-safe: renders `false` on the server / first client paint, then syncs to
 * the real value in an effect. Consumers should treat `false` as the
 * desktop-first default.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);

    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default useIsMobile;
