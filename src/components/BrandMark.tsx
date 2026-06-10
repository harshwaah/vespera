import React from 'react';

export interface BrandMarkProps {
  /**
   * The corner placement of the wordmark.
   * Defaults to 'top-left'.
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Typography variant style.
   * - 'serif': Cormorant Garamond (classic museum/editorial feel)
   * - 'sans': System Sans-serif (Nothing / Acne Studios style)
   * - 'mono': Monospace (Teenage Engineering style)
   * Defaults to 'serif'.
   */
  variant?: 'serif' | 'sans' | 'mono';
  /**
   * Optional custom styles for fine-tuning positioning or overrides.
   */
  style?: React.CSSProperties;
  /**
   * Optional custom class name.
   */
  className?: string;
}

export default function BrandMark({
  position = 'top-left',
  variant = 'serif',
  style,
  className = '',
}: BrandMarkProps) {
  const combinedClass = `brand-mark pos-${position} variant-${variant} ${className}`.trim();

  return (
    <div className={combinedClass} style={style}>
      <span className="brand-mark-text">VESPERA</span>
    </div>
  );
}
