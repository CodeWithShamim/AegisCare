'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { MaskPosition } from '@/hooks/useMaskPositions';

interface MaskedCardProps {
  /** The shared hero image URL painted behind every card. */
  image: string;
  /** Background size/position for this card's window into the image. */
  mask: MaskPosition;
  /** Card content (labels, headline, CTA) layered over the image. */
  children?: ReactNode;
  /** Extra classes for sizing/rounding per placement. */
  className?: string;
  /** Darkening overlay opacity (0–1) for text legibility. Default 0.35. */
  overlay?: number;
}

/**
 * A rounded, overflow-clipped card that shows one windowed crop of a shared
 * background image. Three feature bars + one large hero card each pass a
 * different `mask` (from `useMaskPositions`) so together they read as a single
 * continuous picture split across the grid.
 */
export default function MaskedCard({
  image,
  mask,
  children,
  className = '',
  overlay = 0.35,
}: MaskedCardProps) {
  const bgStyle: CSSProperties = {
    backgroundImage: `url("${image}")`,
    backgroundSize: mask.backgroundSize,
    backgroundPosition: mask.backgroundPosition,
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={bgStyle}
    >
      {/* Legibility overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,${overlay + 0.15}), rgba(0,0,0,${overlay * 0.3}))`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
    </div>
  );
}
