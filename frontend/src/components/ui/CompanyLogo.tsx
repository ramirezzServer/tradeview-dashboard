import { useState } from 'react';

interface CompanyLogoProps {
  /** Finnhub profile.logo URL — may be empty or broken */
  logoUrl:   string | null | undefined;
  /** Fallback: company symbol or name initials */
  symbol:    string;
  className?: string;
  size?:     'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-[13px]',
};

/**
 * Company logo with graceful fallback.
 * Shows the Finnhub logo URL when valid; renders initials-avatar otherwise.
 * Caches broken-URL knowledge in component state to avoid repeated failed loads.
 */
export function CompanyLogo({ logoUrl, symbol, className = '', size = 'md' }: CompanyLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = symbol.slice(0, 2).toUpperCase();
  const sizeClass = sizes[size];

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        onError={() => setImgFailed(true)}
        className={`${sizeClass} rounded-lg object-contain bg-card border border-border/20 p-0.5 ${className}`}
      />
    );
  }

  // Deterministic colour from symbol for visual variety
  const hue = symbol.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{ background: `hsl(${hue}deg 55% 30% / 0.35)`, color: `hsl(${hue}deg 70% 70%)` }}
    >
      {initials}
    </div>
  );
}
