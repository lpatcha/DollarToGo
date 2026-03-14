"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-2xl mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-2">DollarToGo</h1>
        <p className="text-text-muted text-base">Access your digital wallet securely</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
            />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium leading-none text-text-main">
                  Password
                </label>
                <Link href="/reset-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="keepSignedIn"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2 bg-surface"
              />
              <label htmlFor="keepSignedIn" className="text-sm text-text-muted font-medium cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg">
              Sign In <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-muted font-medium">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="social" className="w-full" type="button">
              {/* Note: Replacing actual Google/Apple logos with generic or text for now, could use SVG */}
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
            <Button variant="social" className="w-full" type="button">
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM201.2 43.1C218.1 18.6 232.2 0 232.2 0s-24.3-1.4-44.1 11.2c-15.3 9.7-33.1 27.6-33.1 27.6s17.3 5 36.2-15.7z"></path></svg>
              Apple
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <div className="mt-8 text-center space-y-6">
        <p className="text-text-main text-[15px]">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>

        <div className="flex justify-center space-x-6 text-sm text-text-muted">
          <Link href="#" className="hover:text-text-main transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-text-main transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-text-main transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
