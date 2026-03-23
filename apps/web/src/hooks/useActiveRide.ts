import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

export interface Ride {
  id: string;
  fromAddress: string;
  fromZip: string;
  toAddress: string;
  toZip: string;
  price: number;
  status: string;
  createdAt: string;
  driver?: {
    firstName: string;
    phone: string;
  }
}

export interface Driver {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  rating?: number;
  avgRating?: number;
  totalRatingsCount?: number;
  totalRides?: number;
  vehicle?: string;
  driverProfile?: {
    vehicleMake: string;
    vehicleModel: string;
  }
}

export interface CreateRidePayload {
  fromAddress: string;
  fromZip: string;
  fromLat: number;
  fromLng: number;
  toAddress: string;
  toZip: string;
  toLat: number;
  toLng: number;
  price: number;
}

export function useActiveRide() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [interestedDrivers, setInterestedDrivers] = useState<Driver[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchActiveRide();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('DRIVER_INTERESTED', (data: { rideId: string, driver: Driver }) => {
      setInterestedDrivers(prev => {
        if (!prev.find(d => d.id === data.driver.id)) {
          return [...prev, data.driver];
        }
        return prev;
      });
    });

    newSocket.on('RIDE_CANCELLED', () => {
      setActiveRide(null);
      setInterestedDrivers([]);
    });

    newSocket.on('RIDE_CONFIRMED', () => {
      fetchActiveRide();
    });

    newSocket.on('RIDE_COMPLETED', () => {
      fetchActiveRide();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchActiveRide = async () => {
    try {
      const res = await api.get('/rides/my');
      if (res.data.rides && res.data.rides.length > 0) {
        const ride = res.data.rides[0];
        setActiveRide(ride);
        if (ride.status === 'PENDING') {
          fetchInterestedDrivers(ride.id);
        }
      } else {
        setActiveRide(null);
        setInterestedDrivers([]);
      }
    } catch (err) {
      console.error('Error fetching active ride:', err);
    }
  };

  const fetchInterestedDrivers = async (rideId: string) => {
    try {
      const res = await api.get(`/rides/${rideId}/drivers`);
      setInterestedDrivers(res.data.drivers || []);
    } catch (err) {
      console.error('Error fetching interested drivers:', err);
    }
  };

  const createRide = async (payload: CreateRidePayload) => {
    const res = await api.post('/rides', payload);
    setActiveRide(res.data.ride);
    setInterestedDrivers([]);
    return res;
  };

  const cancelRide = async () => {
    if (!activeRide) return;
    await api.put(`/rides/${activeRide.id}/cancel`);
    setActiveRide(null);
    setInterestedDrivers([]);
  };

  const pickDriver = async (driverId: string) => {
    if (!activeRide) return;
    await api.put(`/rides/${activeRide.id}/pick-driver`, { driverId });
    await fetchActiveRide();
  };

  return {
    activeRide,
    interestedDrivers,
    createRide,
    cancelRide,
    pickDriver
  };
}
