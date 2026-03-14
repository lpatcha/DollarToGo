import React from 'react';
import Link from 'next/link';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { Bell } from 'lucide-react';

// We could technically reuse the BottomNavigation but swap the items for drivers, 
// for now we'll use a modified generic one or build a specific DriverNavigation later.
// The wireframe shows "Requests", "History", "Account" at the bottom.

function DriverHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50 px-5 flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <span className="text-xl text-text-main font-bold">Dollar<span className="text-primary">To</span>Go</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-text-muted hover:text-text-main transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-border">
          {/* Placeholder for avatar */}
          <div className="w-full h-full bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0')] bg-cover"></div>
        </div>
      </div>
    </header>
  );
}

import { DriverBottomNavigation } from '@/components/ui/DriverBottomNavigation';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="w-full h-full max-w-lg mx-auto bg-surface min-h-screen relative shadow-sm flex flex-col">
        <DriverHeader />
        <div className="flex-1">
          {children}
        </div>
      </main>
      <DriverBottomNavigation />
    </div>
  );
}
