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
    'inline-flex items-center justify-center font-sans font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] rounded-[3px]';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 tracking-wide',
    md: 'text-xs md:text-sm px-4 py-2 gap-2 tracking-normal',
    lg: 'text-sm md:text-base px-5 py-2.5 gap-2.5 tracking-normal font-medium',
  };

  const variantStyles = {
    primary:
      'bg-[#18181b] text-white hover:bg-[#27272a] active:bg-[#09090b] border border-[#18181b] shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
    gold:
      'bg-[#966922] text-white hover:bg-[#825b1d] active:bg-[#6e4c16] border border-[#855c1c] shadow-[0_1px_2px_rgba(150,105,34,0.15)]',
    secondary:
      'bg-white text-stone-800 hover:bg-[#f8f7f4] active:bg-[#f1efe8] border border-[#dcd7cb] shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    outline:
      'bg-transparent text-stone-700 hover:text-stone-900 hover:bg-stone-100/70 border border-[#dcd7cb]',
    danger:
      'bg-rose-50 text-rose-800 hover:bg-rose-100 active:bg-rose-200/80 border border-rose-200/80',
    ghost:
      'bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60',
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
