import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { showNotification } from '@/store/slices/uiSlice';
import api from '@/lib/api';

export function useDriverRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  // Use a ref so the socket event listeners always have access to the latest state without needing to re-bind
  const requestsRef = useRef(requests);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/driver/assigned-requests');
      setRequests(res.data.requests || []);
    } catch (err: any) {
      if (!requestsRef.current.length) {
        setError('Failed to fetch assigned requests');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial Fetch
    fetchRequests();

    // 2. Setup Socket
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const socket: Socket = io(socketUrl, {
      auth: { token }
    });

    // 3. Socket Event Listeners

    socket.on('NEW_RIDE_BROADCAST', () => {
      // Only fetch new requests if the driver's screen is currently empty.
      if (requestsRef.current.length === 0) {
        fetchRequests();
      }
    });

    socket.on('RIDE_PRICE_UPDATED', (data: { rideId: string, newPrice: number }) => {
      // Update the price dynamically if the currently viewed ride's price is increased
      setRequests(prev => prev.map(req => {
        if (req.rideId === data.rideId) {
          return {
            ...req,
            ride: {
              ...req.ride,
              price: data.newPrice
            }
          };
        }
        return req;
      }));
    });

    socket.on('RIDE_CONFIRMED', (data: { rideId: string, message: string }) => {
      // Rider picked this driver! Fetch to get updated ride.status
      fetchRequests();
      dispatch(showNotification({ message: data.message || 'Ride Confirmed!', severity: 'success' }));
    });

    socket.on('RIDE_COMPLETED', () => {
      fetchRequests();
    });

    socket.on('RIDE_CANCELLED', (data: { rideId: string }) => {
      handleRideRemoved(data.rideId);
    });

    socket.on('RIDE_UNAVAILABLE', (data: { rideId: string }) => {
      handleRideRemoved(data.rideId);
    });

    const handleRideRemoved = (removedRideId: string) => {
      setRequests(prev => {
        const remaining = prev.filter(req => req.rideId !== removedRideId);
        // If we just removed the only ride on screen, see if there are others in queue
        if (remaining.length === 0 && prev.length > 0) {
          setTimeout(() => fetchRequests(), 500); 
        }
        return remaining;
      });
    };

    return () => {
      socket.disconnect();
    };
  }, [fetchRequests]);

  return {
    requests,
    setRequests, // Exported in case optimistic UI updates need it, e.g. handleDecline
    loading,
    setLoading,
    error,
    setError,
    fetchRequests,
  };
}
