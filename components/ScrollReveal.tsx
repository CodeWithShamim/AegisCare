'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal
 *
 * Mount once per page. It watches every element marked with `data-reveal`
 * and adds the `ac-visible` class the moment it scrolls into view, driving
 * the CSS reveal animations defined in globals.css.
 *
 * Zero dependencies, fully progressive: if IntersectionObserver is missing
 * (or the user prefers reduced motion) elements simply render visible.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]')
    );

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('ac-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ac-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
