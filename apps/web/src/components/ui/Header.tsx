import React from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border z-50 px-4 flex items-center justify-between">
      <Link href="/" className="flex items-center space-x-2">
        <div className="bg-primary p-1.5 rounded-xl">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-text-main">Dollar<span className="text-primary font-bold">To</span>Go</span>
      </Link>
      
      <div className="flex items-center space-x-3">
        <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-text-main transition-colors">
          Login
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-text-main text-white hover:bg-slate-800 rounded-full px-5 h-8">
            Register
          </Button>
        </Link>
      </div>
    </header>
  );
}
