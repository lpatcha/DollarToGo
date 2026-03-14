import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, leftIcon, rightIcon, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    
    const displayType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none text-text-main">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          
          <input
            type={displayType}
            className={cn(
              "flex h-12 w-full rounded-2xl border border-border bg-surface px-3 py-2 text-base ring-offset-background md:text-sm",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-text-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon ? "pl-11" : "",
              (rightIcon || isPasswordType) ? "pr-11" : "",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && !isPasswordType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
