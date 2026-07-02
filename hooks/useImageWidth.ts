'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Measures the rendered width (in CSS px) of an element and keeps it in sync
 * as the element resizes. The masked-card hero uses this to compute the shared
 * background image's `background-size` so every card windows the same picture.
 *
 * Returns a ref-setter to attach to the element and the current width (0 until
 * first measured).
 *
 * @example
 * const [containerRef, width] = useImageWidth<HTMLDivElement>();
 * return <div ref={containerRef} />;
 */
export function useImageWidth<T extends HTMLElement = HTMLElement>(): [
  (node: T | null) => void,
  number,
] {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const setRef = useCallback((node: T | null) => {
    // Tear down any observer bound to a previous node.
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    setWidth(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [setRef, width];
}

export default useImageWidth;
