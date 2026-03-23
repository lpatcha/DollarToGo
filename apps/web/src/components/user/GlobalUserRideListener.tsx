"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '@/store/rootReducer';
import { openRatingModal, closeRatingModal, showNotification, markRideAsRated } from '@/store/slices/uiSlice';
import { RatingModal } from '@/components/ui/RatingModal';
import api from '@/lib/api';

export function GlobalUserRideListener() {
  const dispatch = useDispatch();
  const { ratingModalOpen, ratingRideId } = useSelector((state: RootState) => state.ui);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const socket: Socket = io(socketUrl, {
      auth: { token }
    });

    socket.on('RIDE_COMPLETED', (data: { rideId: string, message?: string }) => {
      // Prompt global modal when a driver pushes 'Complete Ride'
      if (data.rideId) {
        dispatch(openRatingModal({ rideId: data.rideId }));
      }
      if (data.message) {
        dispatch(showNotification({ message: data.message, severity: 'success' }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleSubmitRating = async (score: number, comment: string) => {
    if (!ratingRideId) return;
    setLoading(true);
    try {
      await api.post('/rating', {
        rideId: ratingRideId,
        score,
        comment
      });
      dispatch(showNotification({ message: 'Rating submitted successfully! Thank you!', severity: 'success' }));
      dispatch(markRideAsRated({ rideId: ratingRideId }));
      dispatch(closeRatingModal());
    } catch (err: any) {
      console.error(err);
      dispatch(showNotification({ 
        message: err.response?.data?.message || 'Failed to submit rating.', 
        severity: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => dispatch(closeRatingModal())}
        onSubmit={handleSubmitRating}
        title="Rate Your Driver"
        subtitle="How was your ride?"
        submitText="Submit Rating"
        isLoading={loading}
        showCloseOption={true}
      />
    </>
  );
}
