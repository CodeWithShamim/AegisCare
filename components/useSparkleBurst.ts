'use client';

import { useCallback, useRef } from 'react';

const EMOJIS = ['✨', '🎉', '💜', '🔐', '⭐', '🧬', '🩺', '💫'];

/**
 * useSparkleBurst
 *
 * Returns an onClick handler that rains a short burst of emoji sparkles from
 * the click point — a little hit of delight on primary actions. Honors
 * prefers-reduced-motion (no-op when the user opts out).
 */
export function useSparkleBurst() {
  const cooldown = useRef(false);

  return useCallback((e: { clientX: number; clientY: number }) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (cooldown.current) return;
    cooldown.current = true;
    setTimeout(() => (cooldown.current = false), 400);

    const count = 16;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ac-sparkle';
      span.textContent = EMOJIS[i % EMOJIS.length];
      const startX = e.clientX + (Math.random() * 80 - 40);
      span.style.left = `${startX}px`;
      span.style.top = `${e.clientY}px`;
      span.style.animationDuration = `${0.9 + Math.random() * 0.8}s`;
      span.style.fontSize = `${0.9 + Math.random() * 1.1}rem`;
      document.body.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    }
  }, []);
}
