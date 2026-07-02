'use client';

import { useEffect, useRef } from 'react';

interface StaggeredRevealOptions {
  /** Delay between successive children, in ms. */
  stagger?: number;
  /** Base delay before the first child animates, in ms. */
  baseDelay?: number;
  /** IntersectionObserver threshold. */
  threshold?: number;
  /** Only reveal once (default true). */
  once?: boolean;
}

/**
 * Staggered fade/slide-in for a container's direct children, driven by
 * IntersectionObserver. Attach the returned ref to a wrapper; when it scrolls
 * into view each child transitions in with an incremental delay.
 *
 * Children start hidden via inline styles (so there's no flash of unstyled
 * content) and are revealed by toggling to their resting transform/opacity.
 * Fully respects `prefers-reduced-motion` — reduced-motion users see all
 * children immediately with no transform.
 */
export function useStaggeredReveal<T extends HTMLElement = HTMLElement>({
  stagger = 90,
  baseDelay = 60,
  threshold = 0.15,
  once = true,
}: StaggeredRevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      children.forEach((child) => {
        child.style.opacity = '1';
        child.style.transform = 'none';
      });
      return;
    }

    // Initial hidden state.
    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(28px)';
      child.style.transition =
        'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      child.style.willChange = 'opacity, transform';
    });

    const reveal = () => {
      children.forEach((child, i) => {
        child.style.transitionDelay = `${baseDelay + i * stagger}ms`;
        child.style.opacity = '1';
        child.style.transform = 'none';
      });
    };

    const hide = () => {
      children.forEach((child) => {
        child.style.transitionDelay = '0ms';
        child.style.opacity = '0';
        child.style.transform = 'translateY(28px)';
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            if (once) observer.disconnect();
          } else if (!once) {
            hide();
          }
        }
      },
      { threshold },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [stagger, baseDelay, threshold, once]);

  return ref;
}

export default useStaggeredReveal;
