"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RatingModal } from '@/components/ui/RatingModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import {
  acceptRequestRequest,
  declineRequestRequest,
  completeRideRequest,
  resetActionState
} from '@/store/slices/driverRequestsSlice';
import { useDriverRequests } from '@/hooks/useDriverRequests';

export default function DriverRequestsPage() {
  const {
    requests,
    setRequests,
    loading,
    setLoading,
    error,
    setError,
    fetchRequests
  } = useDriverRequests();

  const dispatch = useDispatch();
  const { actionLoading, success } = useSelector((state: RootState) => state.driverRequests);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  useEffect(() => {
    if (success) {
      if (requests.length > 0) {
        fetchRequests();
      }
      dispatch(resetActionState());
    }
  }, [success, dispatch, fetchRequests, requests.length]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface px-5 py-6 items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-semibold animate-pulse">Loading ride requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-surface px-5 py-6 items-center justify-center pb-24">
        <p className="text-red-500 font-semibold">{error}</p>
        <Button className="mt-4" onClick={() => { setLoading(true); setError(null); fetchRequests(); }}>
          Retry
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-surface px-5 py-6 items-center justify-center pb-24">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-slate-500 font-semibold text-center mb-2">No new ride requests at the moment.</p>
        <p className="text-slate-400 text-sm text-center">We will notify you when a new ride request is available in your enrolled zones.</p>
      </div>
    );
  }

  const activeRequest = requests[0];
  const ride = activeRequest.ride;
  const rider = ride.user;

  // The driver accepted the request but rider hasn't picked them yet
  const isAcceptedWaitingForRider = activeRequest.status === 'ACCEPTED' && ride.status === 'PENDING';

  // The rider picked this driver
  const isConfirmed = activeRequest.status === 'ACCEPTED' && ride.status === 'ACCEPTED';

  // A generic wrapper since both are 'accepted' states from the driver's perspective
  const isHandled = isAcceptedWaitingForRider || isConfirmed;

  const handleAccept = () => {
    dispatch(acceptRequestRequest(activeRequest.id));
  };

  const handleDecline = () => {
    // Dispatch to Redux Saga using the Ride ID, because the backend driverCancelRide will dynamically
    // handle pulling you out of the 'Accepted' queue OR cancelling the deeply 'Confirmed' ride.
    dispatch(declineRequestRequest(activeRequest.ride.id));

    // Aggressively remove it from view locally for better UX
    setRequests(prev => {
      const remaining = prev.filter(req => req.rideId !== activeRequest.ride.id);
      if (remaining.length === 0) {
        setTimeout(() => fetchRequests(), 500);
      }
      return remaining;
    });
  };

  const handleComplete = (score: number, comment: string) => {
    dispatch(completeRideRequest({
      rideId: activeRequest.ride.id,
      rating: { score, comment }
    }));

    setCompleteModalOpen(false);

    // Smooth transition locally
    setRequests(prev => {
      const remaining = prev.filter(req => req.rideId !== activeRequest.ride.id);
      if (remaining.length === 0) {
        setTimeout(() => fetchRequests(), 500);
      }
      return remaining;
    });
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-surface px-5 py-6 pb-24">

        {/* Page Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-[26px] font-extrabold text-text-main mb-1">
              {isConfirmed ? 'Ride Confirmed!' : isAcceptedWaitingForRider ? 'Waiting for Rider' : 'New Ride Request'}
            </h1>
            <p className="text-[15px] text-text-muted">
              {isConfirmed ? 'Head to the pickup location.' : isAcceptedWaitingForRider ? 'Waiting for the rider to confirm you.' : 'A new customer is waiting for a ride'}
            </p>
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Driver Mode</span>
          </div>
        </div>

        {/* Ride Request Card Component */}
        <div className="bg-white border border-border rounded-[24px] p-5 shadow-sm">

          {rider && (
            <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 mr-4">
                {rider.firstName?.[0]}{rider.lastName?.[0]}
              </div>
              <div>
                <p className="text-[16px] font-bold text-text-main">{rider.firstName} {rider.lastName}</p>
                {rider.phone && <p className="text-[13px] font-medium text-text-muted">{rider.phone}</p>}
              </div>
              {isHandled && (
                <div className="ml-auto">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isConfirmed ? 'Confirmed' : 'Accepted'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Route Timeline */}
          <div className="relative pl-3 space-y-6 mb-8 before:absolute before:inset-y-3 before:left-[17px] before:w-0.5 before:bg-slate-200">

            {/* Pickup */}
            <div className="relative">
              <div className="absolute -left-3 top-1 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="pl-6">
                <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">From</span>
                <p className="text-[15px] font-semibold text-text-main">{ride.fromAddress}</p>
                <p className="text-[12px] font-medium text-slate-400 mt-0.5">Zip: {ride.fromZip}</p>
              </div>
            </div>

            {/* Dropoff */}
            <div className="relative">
              <div className="absolute -left-3 top-1 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              </div>
              <div className="pl-6">
                <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">To</span>
                <p className="text-[15px] font-semibold text-text-main">{ride.toAddress}</p>
                <p className="text-[12px] font-medium text-slate-400 mt-0.5">Zip: {ride.toZip}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 w-full mb-5"></div>

          {/* Stats */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Distance</span>
              <p className="text-xl font-bold text-text-main">{Number(activeRequest.estimatedMiles).toFixed(2) || 'N/A'} miles</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase block mb-1">Estimated Fare</span>
              <p className="text-[26px] font-extrabold text-primary">${Number(ride.price).toFixed(2)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={`h-14 rounded-[14px] text-slate-500 hover:text-slate-700 font-semibold text-[15px] transition-colors ${isHandled && !isConfirmed ? 'col-span-2' : ''}`}
              size="lg"
              onClick={handleDecline}
              disabled={actionLoading}
            >
              <X className="w-[18px] h-[18px] mr-2" />
              {isHandled ? 'Cancel Ride' : 'Decline'}
            </Button>

            {!isHandled && (
              <Button
                className="h-14 rounded-[14px] font-semibold text-[15px] shadow-sm"
                size="lg"
                onClick={handleAccept}
                isLoading={actionLoading}
              >
                <CheckCircle2 className="w-[18px] h-[18px] mr-2" />
                Accept Request
              </Button>
            )}

            {isConfirmed && (
              <Button
                className="h-14 rounded-[14px] font-semibold text-[15px] shadow-sm bg-primary text-white hover:bg-primary/90"
                size="lg"
                onClick={() => setCompleteModalOpen(true)}
                isLoading={actionLoading}
              >
                <CheckCircle2 className="w-[18px] h-[18px] mr-2" />
                Complete Ride
              </Button>
            )}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-[11px] font-bold text-text-muted tracking-widest uppercase">
          {isHandled
            ? 'You can gracefully cancel if there are issues'
            : 'Review the route and estimated fare before accepting'}
        </p>

      </div>

      <RatingModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onSubmit={handleComplete}
        title="Rate Your Passenger"
        subtitle={`How was your trip with ${rider?.firstName || 'this passenger'}?`}
        isLoading={actionLoading}
      />
    </>
  );
}
