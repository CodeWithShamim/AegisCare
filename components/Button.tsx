import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'example';
type Size = 'sm' | 'md' | 'lg';

const base =
  'ac-shine inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
  'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
  'focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-r from-indigo-600 to-purple-600 ' +
    'hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 ' +
    'hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.03]',
  secondary:
    'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 ' +
    'hover:scale-[1.03] shadow-sm',
  ghost:
    'text-gray-600 hover:text-indigo-600 hover:bg-gray-50',
  // The delightful "fill example" pill — dashed border, sparkle wand, gentle lift.
  example:
    'text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 ' +
    'border-2 border-dashed border-amber-300 hover:border-amber-400 ' +
    'hover:from-amber-100 hover:to-yellow-100 hover:scale-[1.03] ' +
    'shadow-sm hover:shadow-md',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Shared button with the AegisCare gradient/shine treatment.
 * `variant="example"` is the playful "Fill with example data" pill.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * A ready-made "Fill with example data" button — a sparkle wand icon plus a
 * subtle wiggle on hover. Drop it above a form and wire `onClick` to a sample
 * loader. Pure presentation; the parent owns the data.
 */
export function FillExampleButton({
  className = '',
  label = 'Fill with example data',
  ...rest
}: ButtonProps & { label?: string }) {
  return (
    <Button variant="example" size="sm" className={`group ${className}`} {...rest}>
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m3 21 9-9" />
        <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h0M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />
      </svg>
      {label}
    </Button>
  );
}
