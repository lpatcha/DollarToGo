import React from 'react';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { Bell } from 'lucide-react';

function UserHeader() {
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
          <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" alt="User avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="w-full h-full max-w-lg mx-auto bg-surface min-h-screen relative shadow-sm flex flex-col">
        <UserHeader />
        <div className="flex-1">
          {children}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
