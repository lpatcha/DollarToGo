"use client";

import React from 'react';
import Link from 'next/link';
import { User, LogOut, Shield, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DriverAccountPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[26px] font-extrabold text-text-main tracking-tight">Account</h1>
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-border">
          <div className="w-full h-full bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0')] bg-cover"></div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Settings Link */}
        <Link href="/profile" className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-[16px] hover:bg-slate-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[15px] text-text-main">Profile Settings</p>
              <p className="text-[12px] font-semibold text-slate-400">Personal & Vehicle Info</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        {/* Security Link */}
        {/* <button className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-[16px] hover:bg-slate-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Shield className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[15px] text-text-main">Privacy & Security</p>
              <p className="text-[12px] font-semibold text-slate-400">Password & 2FA</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button> */}

        {/* Documents Link */}
        {/* <button className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-[16px] hover:bg-slate-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[15px] text-text-main">Driver Documents</p>
              <p className="text-[12px] font-semibold text-slate-400">License & Insurance</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button> */}

      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <Button variant="outline" className="w-full h-14 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-[15px] font-bold rounded-xl flex items-center justify-center space-x-2">
          <LogOut className="w-5 h-5 stroke-[2.5px]" />
          <span>Sign Out</span>
        </Button>
      </div>

    </div>
  );
}
