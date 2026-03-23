import React from 'react';
import Link from 'next/link';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { User } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { GlobalUserRideListener } from '@/components/user/GlobalUserRideListener';

function UserHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50 px-5 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center space-x-1 cursor-pointer">
        <span className="text-xl text-text-main font-bold font-outfit">Dollar<span className="text-primary">To</span>Go</span>
      </Link>

      <Link href="/profile" className="flex items-center cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center border-2 border-primary/20 text-text-muted hover:bg-slate-100 transition-colors">
          <User className="w-5 h-5" />
        </div>
      </Link>
    </header>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="w-full h-full max-w-lg mx-auto bg-surface min-h-screen relative shadow-sm flex flex-col">
        <GlobalUserRideListener />
        <UserHeader />
        <div className="flex-1">
          <RoleGuard allowedRole="USER">
            {children}
          </RoleGuard>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
