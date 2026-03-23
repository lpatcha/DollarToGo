"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import { openRatingModal } from '@/store/slices/uiSlice';
import { Car, Banknote, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TripHistoryCard } from '@/components/ui/TripHistoryCard';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import api from '@/lib/api';

interface RideHistory {
  id: string;
  driver?: {
    firstName: string;
    phone: string;
  };
  createdAt: string;
  completedAt?: string;
  price: number | string;
  status: string;
  fromAddress: string;
  toAddress: string;
  notRated?: boolean;
}

export default function HistoryPage() {
  const dispatch = useDispatch();
  const { lastRatedRideId } = useSelector((state: RootState) => state.ui);
  const [rides, setRides] = useState<RideHistory[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalRides, setTotalRides] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Default to 1 week ago
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Default to today
  const [toDate, setToDate] = useState<string>(todayStr);

  console.log(rides);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Strict Calendar Validation: Cannot exceed current date
      if (toDate > todayStr) {
        alert("To Date cannot exceed the current date.");
        setToDate(todayStr); // Snap back to valid state
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
          limit: 100
        }
      });
      setRides(res.data.rides);
      setTotalSpent(Number(res.data.pagination?.totalSpent) || 0);
      setTotalRides(res.data.pagination?.totalCount || 0);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  useEffect(() => {
    if (lastRatedRideId) {
      setRides(prev => prev.map(ride =>
        ride.id === lastRatedRideId ? { ...ride, notRated: false } : ride
      ));
    }
  }, [lastRatedRideId]);

  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24 overflow-y-auto w-full">
      {/* Filters Section */}
      <DateRangePicker
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onApply={fetchHistory}
        loading={loading}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-100 rounded-2xl p-5 shadow-sm bg-white">
          <div className="flex items-center text-text-muted mb-3">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2 text-primary">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Rides</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{loading ? '...' : totalRides}</p>
        </div>

        <div className="border border-slate-100 rounded-2xl p-5 shadow-sm bg-white">
          <div className="flex items-center text-text-muted mb-3">
            <div className="bg-primary/10 p-1.5 rounded-md mr-2 text-primary">
              <Banknote className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{loading ? '...' : `$${totalSpent.toFixed(2)}`}</p>
        </div>
      </div>

      {/* Activity List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[19px] font-extrabold text-text-main">Trip Activity</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm font-semibold">Loading your trips...</div>
        ) : rides.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm font-semibold">No rides found for this date range.</div>
        ) : (
          <div className="space-y-4">
            {rides.map((trip) => {
              const tripDate = new Date(trip.createdAt);
              const dateStr = tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const timeStr = tripDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              const isCompleted = trip.status === 'COMPLETED';

              return (
                <TripHistoryCard
                  key={trip.id}
                  displayName={trip.driver?.firstName || 'Unknown Driver'}
                  dateStr={dateStr}
                  timeStr={timeStr}
                  price={Number(trip.price)}
                  status={trip.status}
                  isCompleted={isCompleted}
                  fromLocation={trip.fromAddress}
                  toLocation={trip.toAddress}
                  footerContent={
                    isCompleted && trip.notRated ? (
                      <button
                        onClick={() => dispatch(openRatingModal({ rideId: trip.id }))}
                        className="w-full py-2.5 mt-1 bg-primary/10 text-primary rounded-xl font-bold text-[14px] hover:bg-primary/20 transition-colors"
                      >
                        Rate your ride
                      </button>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
