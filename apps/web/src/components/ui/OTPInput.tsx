import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OTPInput({ length = 6, value, onChange, className }: OTPInputProps) {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize value array based on length
  const otpArray: string[] = value.split('').slice(0, length);
  while (otpArray.length < length) {
    otpArray.push('');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9A-Za-z]?$/.test(val)) return; // Allow single alphanumeric character

    const newOtpArray = [...otpArray];
    newOtpArray[index] = val;
    const newOtp = newOtpArray.join('');
    onChange(newOtp);

    if (val && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9A-Za-z]/g, '');
    
    if (pastedData) {
      onChange(pastedData + value.slice(pastedData.length));
      
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveInput(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex items-center justify-between w-full space-x-2", className)}>
      {otpArray.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => setActiveInput(index)}
          ref={(el) => { inputRefs.current[index] = el; }}
          className={cn(
            "w-12 h-14 md:w-14 md:h-16 text-center text-xl font-semibold rounded-2xl border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary",
            activeInput === index ? "border-primary" : "border-border text-text-main"
          )}
        />
      ))}
    </div>
  );
}
