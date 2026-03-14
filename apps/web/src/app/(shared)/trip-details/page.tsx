"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Map, Star, Banknote } from 'lucide-react';

export default function TripDetailsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 overflow-y-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <Link href="/history" className="text-text-main hover:bg-slate-100 p-2 rounded-full transition-colors z-10 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold text-text-main absolute left-1/2 -translate-x-1/2">
          Trip Details
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Trip Info Header */}
      <div className="flex justify-between items-start mb-6 border-b border-border pb-6">
        <div>
          <h2 className="text-[28px] font-extrabold text-text-main mb-1 tracking-tight">Trip #DTG-882910</h2>
          <p className="text-[11px] font-bold text-text-muted tracking-widest uppercase">
            October 24, 2023 • 10:30 AM
          </p>
        </div>
        <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
          <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Completed</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center text-text-muted mb-2">
            <Map className="w-4 h-4 mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Distance</span>
          </div>
          <p className="text-[22px] font-bold text-text-main">12.4 miles</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center text-text-muted mb-2">
            <Clock className="w-4 h-4 mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Duration</span>
          </div>
          <p className="text-[22px] font-bold text-text-main">45 mins</p>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
        <div className="relative pl-3 space-y-7 before:absolute before:inset-y-3 before:left-[17px] before:w-px before:bg-slate-300">
          
          {/* Pickup */}
          <div className="relative z-10">
            <div className="absolute -left-3 top-1 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div className="pl-6 pt-0.5">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Pickup</span>
              <p className="text-[15px] font-bold text-text-main leading-tight mb-0.5">Grand Central Terminal</p>
              <p className="text-xs font-medium text-text-muted">89 E 42nd St, New York, NY 10017</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="relative z-10">
            <div className="absolute -left-3 top-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            <div className="pl-6 pt-0.5">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Drop-off</span>
              <p className="text-[15px] font-bold text-text-main leading-tight mb-0.5">JFK International Airport</p>
              <p className="text-xs font-medium text-text-muted">Queens, NY 11430</p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-1">Participants</h3>
        <div className="space-y-3">
          {/* Rider */}
          <div className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 mr-4 border border-slate-200">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" alt="Rider" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-text-main">Alex Johnson</p>
              <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mt-0.5">Rider</p>
            </div>
          </div>

          {/* Driver */}
          <div className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 mr-4 border border-slate-200">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Driver" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-text-main">Marcus Chen</p>
              <div className="flex items-center mt-0.5">
                <Star className="w-3 h-3 text-primary fill-primary mr-1" />
                <span className="text-[11px] font-bold text-text-main mr-1.5">4.9</span>
                <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">• Toyota Camry (Silver)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Charged */}
      <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100/60 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Total Charged</span>
          <p className="text-[28px] font-extrabold text-primary">$41.50</p>
        </div>
        <Banknote className="w-8 h-8 text-primary opacity-80" />
      </div>

      {/* Rating / Review */}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-1">Your Rating</h3>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-primary fill-primary" />
            ))}
          </div>
          <p className="text-[14px] text-text-muted leading-relaxed">
            "Great driver! Very professional and the car was extremely clean. Arrived exactly on time."
          </p>
        </div>
      </div>

    </div>
  );
}
