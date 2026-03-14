"use client";

import React from 'react';
import { Target, Search, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

export default function HomeMapPage() {
  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-slate-100 overflow-hidden">
      <Header />
      
      {/* Map Background Placeholder */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40">
        {/* Fake Map Pin exactly like the wireframe */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <User className="w-5 h-5 text-white stroke-2" />
          </div>
          {/* Shadow pill below pin */}
          <div className="w-4 h-1.5 bg-black/15 rounded-full mt-2 blur-[1px]"></div>
        </div>
      </div>

      {/* Floating Bottom Card */}
      <div className="relative z-10 mt-auto bg-surface rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-5 py-6 sm:max-w-md sm:mx-auto sm:w-full">
        
        <h1 className="text-[32px] font-extrabold text-text-main mt-2 leading-tight tracking-tight">
          Where to <span className="text-primary text-[32px]">next?</span>
        </h1>
        <p className="text-[13px] text-text-muted mt-2 mb-6 font-medium">
          Exclusive launch: Affordable rides for first 100 users.
        </p>

        <Card className="border border-border/50 shadow-sm bg-white overflow-hidden rounded-[24px]">
          <CardContent className="p-4 space-y-3">
            
            {/* Pickup Input */}
            <div className="relative">
              <label className="text-[10px] tracking-wide uppercase font-bold text-text-muted absolute left-12 top-2 z-10">
                Pickup
              </label>
              <Input
                className="pl-12 pt-5 h-[60px] bg-slate-50 border-transparent shadow-none rounded-[16px] text-[15px] font-semibold text-text-main placeholder:text-text-main focus-visible:ring-1 focus-visible:ring-border"
                placeholder="Current Location"
                defaultValue="Current Location"
                leftIcon={<Target className="w-[18px] h-[18px] text-primary" />}
              />
            </div>

            {/* Destination Input */}
            <div className="relative">
              <Input
                className="pl-12 h-[52px] bg-slate-50 border-transparent shadow-none rounded-[16px] text-[15px] font-medium placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-border"
                placeholder="Enter zip code or destination"
                leftIcon={<Search className="w-[18px] h-[18px] text-text-muted" />}
              />
            </div>

            <Button size="lg" className="w-full mt-1 h-[52px] text-base font-semibold rounded-[16px]">
              Request a Ride <ArrowRight className="ml-2 w-[18px] h-[18px] stroke-[2.5px]" />
            </Button>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
