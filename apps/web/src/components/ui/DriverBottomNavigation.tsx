"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DriverBottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border px-6 pb-safe pt-2 z-50">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        
        <Link 
          href="/requests" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/requests' ? 'text-primary' : 'text-text-muted hover:text-primary/70'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === '/requests' ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-wide">Requests</span>
        </Link>
        
        <Link 
          href="/driver-history" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/driver-history' ? 'text-primary' : 'text-text-muted hover:text-primary/70'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === '/driver-history' ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-wide">History</span>
        </Link>
        
        <Link 
          href="/driver-account"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/driver-account' ? 'text-primary' : 'text-text-muted hover:text-primary/70'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === '/driver-account' ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.846.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-wide">Account</span>
        </Link>
        
      </div>
    </div>
  );
}
