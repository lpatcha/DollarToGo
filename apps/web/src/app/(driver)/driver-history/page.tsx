"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Banknote, ChevronRight } from 'lucide-react';
import { TripHistoryCard } from '@/components/ui/TripHistoryCard';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

import api from '@/lib/api';

interface DriverRideHistory {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  price: string | number;
  status: string;
  fromAddress: string;
  toAddress: string;
  estimatedMiles: string | number;
  estimatedMinutes: string | number;
}

export default function DriverHistoryPage() {
  // Set default dates logically matching UserHistoryPage
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [toDate, setToDate] = useState<string>(todayStr);
  const [rides, setRides] = useState<DriverRideHistory[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalRides, setTotalRides] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (toDate > todayStr) {
        alert("To Date cannot exceed the current date.");
        setToDate(todayStr);
        setLoading(false);
        return;
      }
      if (fromDate > toDate) {
        alert("From Date cannot be later than To Date.");
        setFromDate(toDate);
        setLoading(false);
        return;
      }

      const res = await api.get('/rides/history', {
        params: {
          fromDate,
          toDate,
          limit: 10,
          page: 1
        }
      });
      setRides(res.data.rides);
      setTotalEarnings(Number(res.data.pagination?.totalSpent) || 0);
      setTotalRides(res.data.pagination?.totalCount || 0);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to fetch driver history');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[26px] font-extrabold text-text-main tracking-tight">Trip History</h1>
        <div className="bg-primary/10 px-3 py-1.5 rounded-full">
          <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Driver Mode</span>
        </div>
      </div>

      {/* Date Range Selector */}
      <DateRangePicker
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onApply={fetchHistory}
        loading={loading}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Total Deliveries/Rides */}
        <div className="bg-white border border-border rounded-[24px] p-4 shadow-sm">
          <div className="flex items-center text-text-muted mb-2">
            <Truck className="w-[14px] h-[14px] text-primary mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Total Rides</span>
          </div>
          <p className="text-2xl font-extrabold text-text-main">{loading ? '...' : totalRides}</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white border border-border rounded-[24px] p-4 shadow-sm">
          <div className="flex items-center text-text-muted mb-2">
            <Banknote className="w-[14px] h-[14px] text-primary mr-1.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Total Earnings</span>
          </div>
          <p className="text-2xl font-extrabold text-primary">{loading ? '...' : `$${Number(totalEarnings).toFixed(2)}`}</p>
        </div>
      </div>

      {/* Trip List */}
      {loading ? (
        <div className="text-center py-10 text-text-muted text-sm font-semibold">Loading your trips...</div>
      ) : rides.length === 0 ? (
        <div className="text-center py-10 text-text-muted text-sm font-semibold">No finished rides found for this date range.</div>
      ) : (
        <div className="space-y-4">
          {rides.map((trip) => {
            const tripDate = new Date(trip.createdAt);
            const dateStr = tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = tripDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            return (
              <TripHistoryCard
                key={trip.id}
                displayName={trip.user?.firstName ? `${trip.user.firstName} ${trip.user.lastName || ''}`.trim() : 'Unknown Rider'}
                dateStr={dateStr.toUpperCase()}
                timeStr={timeStr.toUpperCase()}
                price={Number(trip.price)}
                status={trip.status}
                isCompleted={trip.status === 'COMPLETED'}
                fromLocation={trip.fromAddress}
                toLocation={trip.toAddress}

              />
            );
          })}
        </div>
      )}

    </div>
  );
}
