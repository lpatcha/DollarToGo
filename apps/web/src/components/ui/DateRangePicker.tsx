import React from 'react';
import { Calendar, Search } from 'lucide-react';
import { TextField } from '@mui/material';

export interface DateRangePickerProps {
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  onApply: () => void;
  loading?: boolean;
}

export function DateRangePicker({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onApply,
  loading = false,
}: DateRangePickerProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="mb-6 bg-white p-4 rounded-[24px] border border-border shadow-sm">
      <h3 className="text-sm font-bold text-text-main mb-3 flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-primary" /> Filter by Date
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted block mb-1">From</label>
          <TextField 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'background.paper', fontSize: '14px' } }}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted block mb-1">To</label>
          <TextField 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'background.paper', fontSize: '14px' } }}
          />
        </div>
      </div>
      <button 
        onClick={onApply}
        disabled={loading}
        className="w-full bg-primary text-white font-bold py-3 mt-1 rounded-[14px] text-sm flex justify-center items-center active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {loading ? 'Searching...' : <><Search className="w-4 h-4 mr-2" /> Apply Filter</>}
      </button>
    </div>
  );
}
