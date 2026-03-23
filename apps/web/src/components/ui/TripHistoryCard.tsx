import React from 'react';
import { Card } from '@/components/ui/Card';
import { User as UserIcon } from 'lucide-react';

export interface TripHistoryCardProps {
  displayName: string;
  dateStr: string;
  timeStr: string;
  price: number | string;
  status: string;
  isCompleted: boolean;
  fromLocation: string;
  toLocation: string;
  footerContent?: React.ReactNode;
}

export function TripHistoryCard({
  displayName,
  dateStr,
  timeStr,
  price,
  status,
  isCompleted,
  fromLocation,
  toLocation,
  footerContent,
}: TripHistoryCardProps) {
  const formattedPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price;

  return (
    <div className="block relative">
      <Card className="p-5 transition-colors bg-white hover:bg-slate-50 relative overflow-hidden border border-border shadow-sm rounded-[24px]">
        {/* Status accent bar */}
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-emerald-500' : 'bg-rose-400'}`} />
        
        {/* Trip Header */}
        <div className="flex justify-between items-start mb-5 pl-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-text-main">
                {displayName}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {dateStr} • {timeStr}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`font-extrabold text-[17px] leading-tight ${isCompleted ? 'text-text-main' : 'text-slate-400 line-through'}`}>
              {formattedPrice}
            </p>
            <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${
              isCompleted ? 'bg-emerald-100/60 text-emerald-600' : 'bg-rose-100/60 text-rose-600'
            }`}>
              {status}
            </div>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="relative pl-5 space-y-4 before:absolute before:inset-y-[10px] before:left-[19px] before:w-px before:bg-slate-200">
          
          {/* Pickup */}
          <div className="relative z-10 w-full overflow-hidden">
            <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full flex items-center justify-center backdrop-blur-sm bg-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div className="pl-4 pt-[2px] w-full pr-1">
              <span className="text-[9px] font-bold tracking-widest uppercase block mb-0.5 text-slate-400">Pickup</span>
              <p className="text-[13px] font-semibold leading-tight text-text-main truncate w-full" title={fromLocation}>
                {fromLocation || 'N/A'}
              </p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="relative z-10 w-full overflow-hidden">
            <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full flex items-center justify-center backdrop-blur-sm bg-slate-200">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            </div>
            <div className="pl-4 pt-[2px] w-full pr-1">
              <span className="text-[9px] font-bold tracking-widest uppercase block mb-0.5 text-slate-400">Drop-off</span>
              <p className="text-[13px] font-semibold leading-tight text-text-main truncate w-full" title={toLocation}>
                {toLocation || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {footerContent && (
          <div className="pt-4 border-t border-slate-100 mt-4">
            {footerContent}
          </div>
        )}

      </Card>
    </div>
  );
}
