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
            className="block text-xs font-medium text-slate-700 tracking-normal"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-xs md:text-sm bg-white text-slate-900 border rounded-xl placeholder:text-slate-400 transition-all focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200/90 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15'
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
