"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-surface px-6 py-8 max-w-lg mx-auto">
      
      {/* Header */}
      <h1 className="text-xl font-bold text-text-main text-center mb-10 mt-2">
        Reset Password
      </h1>

      <div className="flex flex-col mb-8">
        <h2 className="text-[26px] font-extrabold text-text-main mb-2 tracking-tight">
          Forgotten your password?
        </h2>
        <p className="text-[15px] font-medium text-text-muted leading-relaxed">
          Enter your email to receive an OTP and set a new password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* Email Field */}
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="name@example.com"
          leftIcon={<Mail className="w-[18px] h-[18px] text-slate-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-slate-200 h-14 rounded-xl text-[15px]"
        />

        {/* OTP Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1 mb-1">
            <label className="text-[14px] font-bold text-text-main">
              Enter OTP
            </label>
            <button type="button" className="text-[14px] font-bold text-[#0a58ca] hover:underline">
              Resend Code
            </button>
          </div>
          <OTPInput 
            value={otp} 
            onChange={setOtp} 
            length={6} 
          />
        </div>

        {/* New Password */}
        <Input 
          label="New Password" 
          type="password" 
          placeholder="••••••••"
          leftIcon={<Lock className="w-[18px] h-[18px] text-slate-400" />}
          className="bg-white border-slate-200 h-14 rounded-xl text-[15px]"
        />

        {/* Confirm New Password */}
        <Input 
          label="Confirm New Password" 
          type="password" 
          placeholder="••••••••"
          leftIcon={<RefreshCcw className="w-[18px] h-[18px] text-slate-400" />}
          className="bg-white border-slate-200 h-14 rounded-xl text-[15px]"
        />

        <div className="pt-2">
          <Button type="submit" className="w-full h-14 bg-[#0a58ca] hover:bg-[#084298] text-[15px] font-semibold rounded-xl" size="lg">
            Update Password <CheckCircle2 className="ml-2 w-[18px] h-[18px] stroke-[2.5px]" />
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center pb-6">
        <p className="text-text-muted text-[14px] font-medium">
          Suddenly remembered?{' '}
          <Link href="/login" className="text-[#0a58ca] font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
      
      {/* iOS style home indicator mockup */}
      <div className="mt-auto pt-8 flex justify-center pb-2">
        <div className="w-1/3 h-1.5 bg-slate-100 rounded-full"></div>
      </div>
    </div>
  );
}
