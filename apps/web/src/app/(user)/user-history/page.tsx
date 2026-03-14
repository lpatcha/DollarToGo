"use client";

import React from 'react';
import Link from 'next/link';
import { Car, Banknote, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

// Dummy data to populate the history view
const TRIPS = [
  {
    id: 1,
    driverName: 'Alexander Wright',
    date: 'Nov 24',
    time: '4:15 PM',
    price: '$18.50',
    status: 'COMPLETED',
    pickup: 'Beverly Hills, 90210',
    dropoff: 'Hollywood, 90046',
  },
  {
    id: 3,
    driverName: 'Michael Chen',
    date: 'Nov 23',
    time: '11:45 AM',
    price: '$24.75',
    status: 'COMPLETED',
    pickup: 'Culver City, 90232',
    dropoff: 'Santa Monica, 90401',
  }
];

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto w-full">
      


      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-100 rounded-2xl p-5 shadow-sm bg-white">
          <div className="flex items-center text-text-muted mb-3">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2 text-primary">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase">Total Rides</span>
          </div>
          <p className="text-2xl font-bold text-text-main">1,428</p>
        </div>

        <div className="border border-slate-100 rounded-2xl p-5 shadow-sm bg-white">
          <div className="flex items-center text-text-muted mb-3">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2 text-primary">
              <Banknote className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-text-main">$12,840</p>
        </div>
      </div>



      {/* Activity List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[19px] font-extrabold text-text-main">Trip Activity</h2>
          <div className="bg-blue-50 text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Nov 2023
          </div>
        </div>

        <div className="space-y-4">
          {TRIPS.map((trip) => (
            <Link href="/trip-details" key={trip.id} className="block transition-transform active:scale-[0.98]">
              <Card className="p-5 transition-colors bg-white hover:bg-slate-50">
                
                {/* Trip Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-text-main">
                        {trip.driverName}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {trip.date} • {trip.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-extrabold text-[17px] leading-tight text-text-main">
                      {trip.price}
                    </p>
                    <div className="mt-1 inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-emerald-100/60 text-emerald-600">
                      {trip.status}
                    </div>
                  </div>
                </div>

                {/* Route Timeline */}
                <div className="relative pl-3 space-y-4 before:absolute before:inset-y-[10px] before:left-[17px] before:w-px before:bg-slate-200">
                  
                  {/* Pickup */}
                  <div className="relative z-10">
                    <div className="absolute -left-3 top-1 w-4 h-4 rounded-full flex items-center justify-center backdrop-blur-sm bg-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div className="pl-6 pt-[2px]">
                      <span className="text-[9px] font-bold tracking-widest uppercase block mb-0.5 text-slate-400">Pickup</span>
                      <p className="text-[13px] font-semibold leading-tight text-text-main">{trip.pickup}</p>
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="relative z-10">
                    <div className="absolute -left-3 top-1 w-4 h-4 rounded-full flex items-center justify-center backdrop-blur-sm bg-slate-200">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    </div>
                    <div className="pl-6 pt-[2px]">
                      <span className="text-[9px] font-bold tracking-widest uppercase block mb-0.5 text-slate-400">Drop-off</span>
                      <p className="text-[13px] font-semibold leading-tight text-text-main">{trip.dropoff}</p>
                    </div>
                  </div>
                </div>

              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Syncing Archive</span>
      </div>

    </div>
  );
}
