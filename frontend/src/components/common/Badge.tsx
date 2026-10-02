import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1 tracking-normal',
  };

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-900 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200/90',
    gold: 'bg-[#faf6ed] text-[#855c1c] border-[#e2d5bd]',
  };

  return (
    <span
      className={`inline-flex items-center font-sans font-medium border rounded-[2px] ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
