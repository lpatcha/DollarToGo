"use client";

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DriverRequestsPage() {
  return (
    <div className="flex flex-col px-5 py-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-text-main mb-1">New Ride Request</h1>
          <p className="text-[15px] text-text-muted">A new customer is waiting for a ride</p>
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-full">
          <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Driver Mode</span>
        </div>
      </div>

      {/* Ride Request Card Component (Inline for now, can be extracted later) */}
      <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 shadow-sm">
        
        {/* Route Timeline */}
        <div className="relative pl-3 space-y-6 mb-8 before:absolute before:inset-y-3 before:left-[17px] before:w-0.5 before:bg-slate-200">
          
          {/* Pickup */}
          <div className="relative">
            <div className="absolute -left-3 top-1 w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="pl-6">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">From</span>
              <p className="text-[15px] font-semibold text-text-main">123 Maple St, Downtown</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="relative">
            <div className="absolute -left-3 top-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            <div className="pl-6">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">To</span>
              <p className="text-[15px] font-semibold text-text-main">456 Oak Ave, Westside</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 w-full mb-5"></div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Distance</span>
            <p className="text-xl font-bold text-text-main">4.2 miles</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Estimated Fare</span>
            <p className="text-[26px] font-extrabold text-primary">$18.50</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-14 rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-red-500 font-semibold text-base transition-colors" size="lg">
            <X className="w-5 h-5 mr-2" />
            Decline
          </Button>
          <Button className="h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base shadow-sm" size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Accept Request
          </Button>
        </div>
      </div>

      {/* Footer text */}
      <p className="text-center mt-6 text-[11px] font-bold text-text-muted tracking-widest uppercase">
        Request expires in 24 seconds
      </p>

    </div>
  );
}
