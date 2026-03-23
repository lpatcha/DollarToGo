"use client";

import React, { useState } from 'react';
import Script from 'next/script';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Chip,
  Autocomplete,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  MapPin,
  Banknote,
  X,
  Circle,
  Car
} from 'lucide-react';
import { useGoogleAutocomplete, AddressDetails } from '@/hooks/useGoogleAutocomplete';
import { useActiveRide } from '@/hooks/useActiveRide';

// Helper: Haversine formula to find bare-minimum straight-line distance in miles
function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export default function UserDashboardPage() {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      setGoogleLoaded(true);
    }
  }, []);
  
  // Custom API Hooks
  const fromSearch = useGoogleAutocomplete(googleLoaded);
  const toSearch = useGoogleAutocomplete(googleLoaded);
  const [price, setPrice] = useState('');

  // Auto-calculate default price when both addresses are selected
  React.useEffect(() => {
    if (fromSearch.value && toSearch.value && !price) {
      const straightLineMiles = calculateDistanceInMiles(
        fromSearch.value.lat, 
        fromSearch.value.lng, 
        toSearch.value.lat, 
        toSearch.value.lng
      );
      
      // Multiply by 1.25 to estimate road driving instead of birds-eye-view
      const drivingEstimate = straightLineMiles * 1.25;
      
      // $1.00 per mile, rounded up, with a minimum fare of $5
      const suggestedPrice = Math.max(5, Math.ceil(drivingEstimate));
      
      setPrice(suggestedPrice.toString());
    }
  }, [fromSearch.value, toSearch.value]);

  const {
    activeRide,
    interestedDrivers,
    createRide,
    cancelRide,
    pickDriver
  } = useActiveRide();

  const handlePostRequest = async () => {
    try {
      await createRide({
        fromAddress: fromSearch.value?.address || '',
        fromZip: fromSearch.value?.zip || '',
        fromLat: fromSearch.value?.lat || 0,
        fromLng: fromSearch.value?.lng || 0,
        toAddress: toSearch.value?.address || '',
        toZip: toSearch.value?.zip || '',
        toLat: toSearch.value?.lat || 0,
        toLng: toSearch.value?.lng || 0,
        price: parseFloat(price)
      });
      
      alert('Ride created successfully!');
      
      fromSearch.setInputValue('');
      fromSearch.setValue(null);
      toSearch.setInputValue('');
      toSearch.setValue(null);
      setPrice('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create ride');
    }
  };

  const handleCancelRide = async () => {
    try {
      await cancelRide();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancel ride error');
    }
  };

  const handlePickDriver = async (driverId: string) => {
    try {
      await pickDriver(driverId);
      alert('Driver picked! Wait for them to arrive.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Pick driver error');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh', py: 4, px: 2 }}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => setGoogleLoaded(true)}
        onReady={() => setGoogleLoaded(true)}
      />

      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              opacity: activeRide ? 0.5 : 1, 
              pointerEvents: activeRide ? 'none' : 'auto' 
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, fontOutFit: 'true' }}>
              Create Ride Request
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {activeRide ? 'You currently have an active ride request in progress.' : 'Where would you like to go today?'}
            </Typography>

            <Stack spacing={2.5}>
              <Autocomplete
                id="from-address"
                getOptionLabel={(option) => option.description || ''}
                filterOptions={(x) => x}
                options={fromSearch.options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                disabled={!googleLoaded || !!activeRide}
                value={fromSearch.options.find(opt => opt.description === fromSearch.value?.address) || null}
                noOptionsText="Start typing an address..."
                onChange={(event: any, newValue: AddressDetails | null) => {
                  fromSearch.handleSelect(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  fromSearch.setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="From Zip/Address"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1 }}>
                          <Circle size={18} color="var(--mui-palette-primary-main)" fill="var(--mui-palette-primary-main)" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {fromSearch.loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default', border: 'none' } }}
                  />
                )}
              />

              <Autocomplete
                id="to-address"
                getOptionLabel={(option) => option.description || ''}
                filterOptions={(x) => x}
                options={toSearch.options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                disabled={!googleLoaded || !!activeRide}
                value={toSearch.options.find(opt => opt.description === toSearch.value?.address) || null}
                noOptionsText="Start typing an address..."
                onChange={(event: any, newValue: AddressDetails | null) => {
                  toSearch.handleSelect(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  toSearch.setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="To Zip/Address"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1 }}>
                          <MapPin size={18} color="var(--mui-palette-primary-main)" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {toSearch.loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default', border: 'none' } }}
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Price ($)"
                  variant="outlined"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  disabled={!!activeRide}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Banknote size={18} color="var(--mui-palette-primary-main)" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' } }}
                />
                <Button
                  onClick={handlePostRequest}
                  variant="contained"
                  fullWidth
                  disabled={!fromSearch.value || !toSearch.value || !price || !!activeRide}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    height: 56,
                    boxShadow: (theme) => `0 8px 16px -4px ${theme.palette.primary.main}33`
                  }}
                >
                  Post Request
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {activeRide && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Active Ride
                </Typography>
                <Chip
                  label={activeRide.status}
                  size="small"
                  sx={{
                    bgcolor: activeRide.status === 'PENDING' ? 'warning.light' : 'primary.light',
                    color: activeRide.status === 'PENDING' ? 'warning.dark' : 'primary.main',
                    fontWeight: 700,
                    opacity: 0.9
                  }}
                />
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  mb: 3
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1, textTransform: 'uppercase' }}>
                      {activeRide.status === 'PENDING' ? 'Searching for Driver' : `Driver Assigned: ${activeRide.driver?.firstName || ''}`}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Requested {new Date(activeRide.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    ${activeRide.price}
                  </Typography>
                </Stack>

                <Box sx={{ pl: 1, position: 'relative', mb: 4 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 11,
                      top: 10,
                      bottom: 10,
                      width: '1px',
                      bgcolor: 'divider'
                    }}
                  />

                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid', borderColor: 'primary.main', bgcolor: 'background.paper', zIndex: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {activeRide.fromAddress}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', zIndex: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activeRide.toAddress}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<X size={18} />}
                    onClick={handleCancelRide}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                  >
                    Cancel Ride
                  </Button>
                </Stack>
              </Paper>

              {activeRide.status === 'PENDING' && interestedDrivers.length > 0 && (
                <Box sx={{ mt: 3, mb: 10 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Available Drivers ({interestedDrivers.length})
                  </Typography>
                  <Stack spacing={2}>
                    {interestedDrivers.map(driver => (
                      <Paper key={driver.id} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: '#f0fdf4' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                              <Car size={18} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Unknown Driver'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ⭐ {(driver.rating || driver.avgRating || 5).toFixed(1)} ({driver.totalRatingsCount || 0}) • 🚗 {driver.totalRides || 0} Rides • {driver.vehicle || (driver.driverProfile ? `${driver.driverProfile.vehicleMake} ${driver.driverProfile.vehicleModel}` : 'Standard Vehicle')}
                              </Typography>
                            </Box>
                          </Stack>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ borderRadius: 2, fontWeight: 700, backgroundColor: 'primary.main' }} 
                            onClick={() => handlePickDriver(driver.id)}>
                            Accept
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
