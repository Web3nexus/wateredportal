import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-sans font-medium text-stone-700 tracking-normal"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 text-xs md:text-sm bg-white text-stone-900 border rounded-[3px] placeholder:text-stone-400 transition-colors focus:outline-none disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
              : 'border-[#dcd7cb] focus:border-[#966922] focus:ring-1 focus:ring-[#966922]/15'
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="text-[11px] text-rose-600 font-sans mt-1">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-stone-500 font-sans mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
