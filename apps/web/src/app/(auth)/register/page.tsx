"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [role, setRole] = useState<'USER' | 'DRIVER'>('USER');

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 py-6 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <Link href="/login" className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors z-10">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-text-main absolute left-1/2 -translate-x-1/2">
          Create Account
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex flex-col mb-8">
        <h2 className="text-3xl font-bold text-text-main mb-2">Join DollarToGo</h2>
        <p className="text-text-muted text-base">
          Fill in your details to get started with our platform.
        </p>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" />
          <Input label="Last Name" placeholder="Doe" />
        </div>

        <Input label="Email" type="email" placeholder="example@mail.com" />
        
        <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
        
        <Input label="Password" type="password" placeholder="••••••••" />

        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium leading-none text-text-main">
            I want to join as a:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`flex items-center justify-center p-4 border rounded-2xl transition-all ${
                role === 'USER' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border bg-surface text-text-muted hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              <span className="font-semibold">User</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`flex items-center justify-center p-4 border rounded-2xl transition-all ${
                role === 'DRIVER' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border bg-surface text-text-muted hover:bg-slate-50'
              }`}
            >
              <Car className="w-5 h-5 mr-3" />
              <span className="font-semibold">Driver</span>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full mt-4" size="lg">
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center pb-6">
        <p className="text-text-main text-[15px]">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
