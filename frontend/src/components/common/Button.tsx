import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-wide',
    md: 'text-xs md:text-sm px-4 py-2.5 gap-2 tracking-normal',
    lg: 'text-sm md:text-base px-5 py-3 gap-2.5 tracking-normal font-medium',
  };

  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-slate-900 shadow-sm',
    gold:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 border border-indigo-600 shadow-sm',
    secondary:
      'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 shadow-sm',
    outline:
      'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200',
    danger:
      'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200/80 border border-rose-200',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 mr-2 text-current opacity-75"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
