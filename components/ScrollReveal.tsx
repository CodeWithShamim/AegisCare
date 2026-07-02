'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal
 *
 * Mount once per page. It watches every element marked with `data-reveal`
 * and adds the `ac-visible` class the moment it scrolls into view, driving
 * the CSS reveal animations defined in globals.css.
 *
 * Robust to async content: many pages (e.g. Analytics) render their
 * `data-reveal` markup only after an on-chain fetch resolves — long after this
 * component first mounts. A MutationObserver picks up those late-arriving
 * elements so they still reveal instead of being stuck at `opacity: 0`.
 *
 * Zero dependencies, fully progressive: if IntersectionObserver is missing
 * (or the user prefers reduced motion) elements simply render visible.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const revealAll = () =>
      document
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((el) => el.classList.add('ac-visible'));

    // No animation to orchestrate: just make everything (present and future)
    // visible. The reduced-motion CSS already forces opacity, but we add the
    // class too so state stays consistent.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ac-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    // Observe an element only once. `observe()` is idempotent per target, so
    // re-scanning after DOM mutations is safe and cheap.
    const observeReveals = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.ac-visible)')
        .forEach((el) => io.observe(el));
    };

    observeReveals();

    // Pick up elements added after mount (async-rendered dashboards, lists…).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length) {
          observeReveals();
          break;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
