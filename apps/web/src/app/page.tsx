"use client";

import React from 'react';
import { ShieldCheck, Zap, DollarSign, ArrowRight, User } from 'lucide-react';
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
          Ride for <span className="text-primary text-[32px]">less.</span>
        </h1>
        <p className="text-[14px] text-text-muted mt-2 mb-6 font-medium leading-relaxed">
          The fair-price ride sharing platform that puts more money in driver pockets and keeps more in yours.
        </p>

        <Card className="border border-border/50 shadow-sm bg-white overflow-hidden rounded-[24px]">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-[15px]">Transparent Pricing</h3>
                <p className="text-[13px] text-text-muted">No hidden fees. You see exactly what you pay and what the driver earns.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/10 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-[15px]">Zero Wait Time</h3>
                <p className="text-[13px] text-text-muted">Direct dispatch to the nearest available drivers in your zip code.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-500/10 p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-[15px]">Secure & Verified</h3>
                <p className="text-[13px] text-text-muted">All drivers undergo rigorous background checks for your peace of mind.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={() => window.location.href = '/login'}
                size="lg" 
                className="w-full h-[56px] text-base font-bold rounded-[18px] shadow-md hover:shadow-lg transition-all"
              >
                Join the Community <ArrowRight className="ml-2 w-[18px] h-[18px] stroke-[2.5px]" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
