"use client";

import React from 'react';
import { MapPin, Search, Banknote, X, PenLine } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function UserDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto w-full">
      


      {/* Create Ride Request Form */}
      <Card className="p-6 mb-8 border-slate-100 shadow-sm rounded-3xl">
        <h2 className="text-[22px] font-extrabold text-text-main mb-1 tracking-tight">Create Ride Request</h2>
        <p className="text-[13px] text-text-muted mb-6 font-medium">Where would you like to go today?</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input 
            leftIcon={<div className="w-4 h-4 border-[3px] border-primary rounded-full relative"><div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-surface rounded-full"></div></div>}
            placeholder="From Zip/Address"
            className="h-14 rounded-2xl bg-white border-slate-200 text-[15px] font-medium placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
          />
          
          <Input 
            leftIcon={<MapPin className="w-[18px] h-[18px] text-primary" />}
            placeholder="To Zip/Address"
            className="h-14 rounded-2xl bg-white border-slate-200 text-[15px] font-medium placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
          />

          <div className="flex space-x-3 pt-2">
            <div className="flex-1">
              <Input 
                leftIcon={<Banknote className="w-5 h-5 text-primary" />}
                placeholder="Offer Price ($)"
                className="h-[52px] rounded-[20px] bg-white border-slate-200 text-[15px] font-medium placeholder:text-slate-400"
              />
            </div>
            <Button className="flex-1 h-[52px] rounded-[20px] font-semibold text-[15px] shadow-sm bg-primary hover:bg-primary/90">
              Post Request
            </Button>
          </div>
        </form>
      </Card>

      {/* Pending Requests Section */}
      <div>
        <h3 className="text-[19px] font-extrabold text-text-main mb-4 tracking-tight">Pending Requests</h3>
        
        <Card className="p-5 border-slate-100 shadow-sm rounded-[24px]">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">Searching for Driver</span>
              <p className="text-[11px] font-medium text-text-muted">Requested 5m ago</p>
            </div>
            <p className="text-[22px] font-extrabold text-text-main">$12.50</p>
          </div>

          {/* Route Elements */}
          <div className="relative pl-3 space-y-5 mb-7 before:absolute before:inset-y-[10px] before:left-[17px] before:w-px before:bg-slate-200">
            
            {/* Pickup */}
            <div className="relative z-10">
              <div className="absolute -left-3 top-1 w-4 h-4 border-[3px] border-primary rounded-full bg-white flex items-center justify-center ring-4 ring-white">
                <div className="w-1.5 h-1.5 bg-surface rounded-full"></div>
              </div>
              <div className="pl-6 pt-0.5">
                <p className="text-[14px] font-medium text-text-muted leading-tight">90210 - Beverly Hills, CA</p>
              </div>
            </div>

            {/* Dropoff */}
            <div className="relative z-10">
              <div className="absolute -left-3 top-0.5 w-4 h-4 border-[4px] border-primary bg-primary rounded-full flex items-center justify-center ring-4 ring-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <div className="pl-6 pt-0.5">
                <p className="text-[15px] font-semibold text-text-main leading-tight">10001 - Madison Sq Garden, NY</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-[46px] rounded-[20px] border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold transition-colors">
              <X className="w-4 h-4 mr-2 stroke-[2.5px]" />
              Cancel
            </Button>
            <Button variant="outline" className="h-[46px] rounded-[20px] border-blue-200 text-primary hover:bg-blue-50 font-bold transition-colors bg-blue-50/30">
              <PenLine className="w-4 h-4 mr-2" />
              Update Price
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}
