"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Truck, Banknote, ChevronDown, CheckCircle2, ChevronRight, UserCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const HISTORY = [
  {
    id: 1,
    date: 'OCT 24, 2023',
    time: '2:45 PM',
    customerName: 'John D.',
    price: '$15.00',
    status: 'COMPLETED',
    fromZip: '90210',
    toZip: '90401',
    distance: '4.2 MILES',
    duration: '18 MIN',
  },
  {
    id: 2,
    date: 'OCT 24, 2023',
    time: '11:15 AM',
    customerName: 'Sarah M.',
    price: '$22.50',
    status: 'COMPLETED',
    fromZip: '90034',
    toZip: '90045',
    distance: '8.5 MILES',
    duration: '24 MIN',
  },
  {
    id: 3,
    date: 'OCT 23, 2023',
    time: '6:30 PM',
    customerName: 'Mike T.',
    price: '$12.00',
    status: 'COMPLETED',
    fromZip: '90025',
    toZip: '90210',
    distance: '3.1 MILES',
    duration: '12 MIN',
  }
];

export default function DriverHistoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[26px] font-extrabold text-text-main tracking-tight">Trip History</h1>
        <div className="bg-blue-50 text-user-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
          DRIVER MODE
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-user-primary" />
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-0.5">Date Range</span>
            <p className="text-[15px] font-bold text-text-main leading-tight">All Time (Lifetime)</p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Total Deliveries/Rides */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center text-text-muted mb-2">
            <Truck className="w-[14px] h-[14px] text-user-primary mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Deliveries</span>
          </div>
          <p className="text-2xl font-extrabold text-text-main">142</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center text-text-muted mb-2">
            <Banknote className="w-[14px] h-[14px] text-user-primary mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Earnings</span>
          </div>
          <p className="text-2xl font-extrabold text-user-primary">$2,845.50</p>
        </div>
      </div>

      {/* Trip List */}
      <div className="space-y-4">
        {HISTORY.map((trip) => (
          <Card key={trip.id} className="bg-slate-50/50 border-transparent shadow-none p-5 rounded-[20px]">
            
            {/* Trip Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                  {trip.date} • {trip.time}
                </p>
                <p className="text-[17px] font-bold text-text-main">
                  {trip.customerName}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[20px] font-extrabold text-user-primary leading-tight mb-1">
                  {trip.price}
                </p>
                <div className="flex items-center space-x-1 text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div className="relative pl-2.5 space-y-4 before:absolute before:inset-y-[10px] before:left-[13px] before:w-px before:bg-slate-200 mb-6 w-full">
              {/* From */}
              <div className="relative z-10 flex items-center">
                <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-[#a3c2fa] shadow-[0_0_0_2px_#f8fafc]"></div>
                <div className="pl-6 w-full">
                  <p className="text-[14px] font-medium text-text-main">
                    <span className="text-slate-400 font-semibold mr-1">From:</span> {trip.fromZip}
                  </p>
                </div>
              </div>

              {/* To */}
              <div className="relative z-10 flex items-center">
                <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-[#fca5a5] shadow-[0_0_0_2px_#f8fafc]"></div>
                <div className="pl-6 w-full">
                  <p className="text-[14px] font-medium text-text-main">
                    <span className="text-slate-400 font-semibold mr-1">To:</span> {trip.toZip}
                  </p>
                </div>
              </div>
            </div>

            {/* Trip Footer Details */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
              <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                {trip.distance} • {trip.duration}
              </span>
              <Link href="/trip-details" className="flex items-center text-[12px] font-bold text-user-primary hover:underline">
                Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

          </Card>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center space-x-1.5 mt-8">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-user-primary"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
      </div>
      
    </div>
  );
}
