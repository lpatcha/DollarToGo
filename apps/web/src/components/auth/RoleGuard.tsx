"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function RoleGuard({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: 'USER' | 'DRIVER' | 'ADMIN' 
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If not logged in at all, redirect to login
  if (!token || !user) {
    router.replace('/login');
    return null;
  }

  // If logged in but attempting to access a route they don't have permissions for
  if (user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-red-50/50">
          <ShieldAlert size={36} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-text-main mb-2 font-outfit">Unauthorized Area</h1>
        <p className="text-text-muted mb-8 max-w-xs">
          You are currently logged in as a {user.role}, which does not grant access to {allowedRole.toLowerCase()} pages.
        </p>
        
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 bg-white border border-border text-text-main px-6 py-3 rounded-full font-semibold shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
