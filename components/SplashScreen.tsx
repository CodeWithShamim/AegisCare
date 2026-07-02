'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Timing constants for the splash sequence. Kept together so the counter
 * animation, fade, and unmount stay in lockstep with the design brief:
 *   0 → 100 over COUNT_MS, hold HOLD_MS, fade over FADE_MS, then unmount.
 */
const COUNT_MS = 2000;
const HOLD_MS = 200;
const FADE_MS = 700;
const UNMOUNT_AFTER_FADE_MS = 900;

/**
 * One-shot loading splash shown on the initial landing-page render.
 *
 * A bottom-left counter ticks 0 → 100 over 2s; 200ms after hitting 100 the
 * overlay fades out (700ms) and unmounts 900ms later. Honors
 * `prefers-reduced-motion` by skipping straight to a brief static frame.
 */
export default function SplashScreen() {
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      // No animated count-up; show 100 briefly, then leave.
      setCount(100);
      const fadeTimer = window.setTimeout(() => setFading(true), HOLD_MS);
      const doneTimer = window.setTimeout(
        () => setDone(true),
        HOLD_MS + UNMOUNT_AFTER_FADE_MS,
      );
      return () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(doneTimer);
      };
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / COUNT_MS, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const fadeTimer = window.setTimeout(() => setFading(true), COUNT_MS + HOLD_MS);
    const doneTimer = window.setTimeout(
      () => setDone(true),
      COUNT_MS + HOLD_MS + UNMOUNT_AFTER_FADE_MS,
    );

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-end bg-white transition-opacity duration-700 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <span className="select-none p-6 text-7xl font-bold tabular-nums leading-none text-black md:p-10 md:text-9xl">
        {count}
      </span>
    </div>
  );
}
