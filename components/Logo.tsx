import React from 'react';

/**
 * AegisCare brand mark.
 *
 * A shield (aegis = protection) enclosing a heartbeat pulse (care = health),
 * rendered in the indigo→purple→pink brand gradient. Reads cleanly from
 * favicon size up to hero size.
 */
export default function Logo({
  className = '',
  size = 32,
  withGlow = false,
}: {
  className?: string;
  size?: number;
  withGlow?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AegisCare"
    >
      <defs>
        <linearGradient id="ac-logo-grad" x1="6" y1="3" x2="42" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        {withGlow && (
          <filter id="ac-logo-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Shield body */}
      <path
        d="M24 3.5l15 5.2v10.1c0 9.7-6.2 18.4-15 21.7-8.8-3.3-15-12-15-21.7V8.7l15-5.2z"
        fill="url(#ac-logo-grad)"
        filter={withGlow ? 'url(#ac-logo-glow)' : undefined}
      />
      {/* Inner shield highlight */}
      <path
        d="M24 8l10.5 3.6v7.1c0 6.9-4.3 13.1-10.5 15.6-6.2-2.5-10.5-8.7-10.5-15.6v-7.1L24 8z"
        fill="white"
        fillOpacity="0.14"
      />
      {/* Heartbeat pulse */}
      <path
        d="M13.5 24.5h4l2.4-5.4 3.4 9.6 2.8-6.2 1.6 2h5.2"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
