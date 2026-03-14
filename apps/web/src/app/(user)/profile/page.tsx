"use client";

import React from 'react';
import { Camera, User, Shield, PenLine, Lock, RefreshCcw, ChevronRight, Car } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 overflow-y-auto pb-24">
      
      {/* Header */}
      <div className="flex justify-center mb-6">
        <h1 className="text-xl font-bold text-text-main">Edit Profile</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-surface shadow-sm ring-1 ring-border">
            {/* Real image mapped to the wireframe */}
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop" 
              alt="Profile avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-surface shadow-sm text-white hover:bg-primary/90 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <h2 className="text-[22px] font-bold text-text-main mb-1">Alex Sterling</h2>
        <button className="text-[13px] font-bold text-primary hover:underline">
          Change Profile Picture
        </button>
      </div>

      {/* Form Fields */}
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-text-main mb-2">
            <User className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Personal Information</span>
          </div>

          <Input 
            label="First Name" 
            defaultValue="Alex" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="Last Name" 
            defaultValue="Sterling" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="Email Address" 
            defaultValue="alex.sterling@example.com" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="Phone Number" 
            defaultValue="+1 (555) 123-4567" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Vehicle Information (Conditional for Drivers) */}
        {/* We use a mock boolean here to demonstrate the UI. In the real app, this would be based on the user's role */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-text-main mb-2">
            <Car className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Vehicle Information</span>
          </div>

          <Input 
            label="Vehicle Make" 
            defaultValue="Toyota" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="Vehicle Model" 
            defaultValue="Camry" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="Vehicle Year" 
            defaultValue="2022" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="License Plate" 
            defaultValue="ABC-1234" 
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Security section (matching wireframe) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-text-main mb-2">
            <Shield className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Security</span>
          </div>

          <Input 
            label="Current Password" 
            type="password"
            placeholder="Enter your current password" 
            className="bg-slate-50 border-slate-200"
          />
          
          <Input 
            label="New Password" 
            type="password"
            placeholder="Leave blank to keep current" 
            className="bg-slate-50 border-slate-200"
          />

          <button type="button" className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 text-primary rounded-xl hover:bg-primary/5 transition-colors">
            <div className="flex items-center space-x-3 font-semibold text-sm">
              <RefreshCcw className="w-5 h-5 stroke-[2.5px]" />
              <span>Enable Two-Factor Auth</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2">
          <Button size="lg" className="w-full h-14 bg-[#0a58ca] hover:bg-[#084298] text-[15px] font-semibold rounded-xl">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
