'use client';

import { useMemo } from 'react';

/**
 * A single card's window into the shared hero image, expressed as ready-to-use
 * CSS background values.
 */
export interface MaskPosition {
  backgroundSize: string;
  backgroundPosition: string;
}

/**
 * The masked-card hero paints ONE image across a grid of cards: three slim
 * "feature bars" plus one large hero card. Each card is a window onto the same
 * picture — we achieve this by giving every card the full virtual-image
 * `background-size` and a negative `background-position` equal to the card's
 * offset within the virtual image. Panning the position per card reveals a
 * different crop while the picture stays visually continuous.
 *
 * Desktop layout (virtual image = container width):
 *   ┌─────────────┬───────────────────────────┐
 *   │ bar 0       │                            │
 *   ├─────────────┤          hero              │
 *   │ bar 1       │        (right col)         │
 *   ├─────────────┤                            │
 *   │ bar 2       │                            │
 *   └─────────────┴───────────────────────────┘
 *
 * Mobile: cards stack, so the image is windowed vertically instead.
 *
 * @param width  Measured container width in px (from `useImageWidth`).
 * @param isMobile  Whether we're below the md breakpoint (stacked layout).
 * @param barCount  Number of feature bars (defaults to 3).
 */
export function useMaskPositions(
  width: number,
  isMobile: boolean,
  barCount = 3,
): { bars: MaskPosition[]; hero: MaskPosition } {
  return useMemo(() => {
    // Fractions of the container used by the left (bars) column on desktop.
    const LEFT_COL = 0.38; // 38% width for the feature-bar column
    const virtualWidth = Math.max(width, 1);

    if (isMobile) {
      // Stacked: full-width slices panned vertically. We model a tall virtual
      // image (barCount slim bars + one tall hero) and offset each vertically.
      const rows = barCount + 1;
      const virtualHeight = virtualWidth * 1.9; // pleasant portrait-ish crop
      const barSlice = virtualHeight / (rows + 1); // hero gets the extra row
      const bars: MaskPosition[] = Array.from({ length: barCount }, (_, i) => ({
        backgroundSize: `${virtualWidth}px ${virtualHeight}px`,
        backgroundPosition: `50% -${Math.round(i * barSlice)}px`,
      }));
      const hero: MaskPosition = {
        backgroundSize: `${virtualWidth}px ${virtualHeight}px`,
        backgroundPosition: `50% -${Math.round(barCount * barSlice)}px`,
      };
      return { bars, hero };
    }

    // Desktop: bars stack in the left column; hero fills the right column.
    const leftWidth = Math.round(virtualWidth * LEFT_COL);
    const virtualHeight = Math.round(virtualWidth * 0.62); // hero aspect
    const barHeight = virtualHeight / barCount;

    const bars: MaskPosition[] = Array.from({ length: barCount }, (_, i) => ({
      backgroundSize: `${virtualWidth}px ${virtualHeight}px`,
      backgroundPosition: `0px -${Math.round(i * barHeight)}px`,
    }));

    const hero: MaskPosition = {
      backgroundSize: `${virtualWidth}px ${virtualHeight}px`,
      backgroundPosition: `-${leftWidth}px 0px`,
    };

    return { bars, hero };
  }, [width, isMobile, barCount]);
}

export default useMaskPositions;
