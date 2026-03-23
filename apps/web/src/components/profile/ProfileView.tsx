"use client";

import React, { useState, useEffect } from 'react';
import { Camera, User, Shield, PenLine, Car, MapPin, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import * as zipcodes from 'zipcodes';

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import { updateProfileRequest, updatePasswordRequest, resetProfileState } from '@/store/slices/profileSlice';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';

export function ProfileView() {
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedState, setSelectedState] = useState('');
  const [accordionOpen, setAccordionOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading: saving, success } = useSelector((state: RootState) => state.profile);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  // Unified form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    driverProfile: {
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      licensePlate: '',
      serviceZipCodes: '',
    }
  });

  const stateZipData = React.useMemo(() => {
    if (!selectedState) return [];
    const results = zipcodes.lookupByState(selectedState) || [];
    return Array.from(new Map(results.map((item: any) => [item.zip, item])).values()) as any[];
  }, [selectedState]);

  const currentEnrolledZips = formData.driverProfile.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);

  const enrolledInState = stateZipData.filter((z: any) => currentEnrolledZips.includes(z.zip));
  const unenrolledInState = stateZipData.filter((z: any) => !currentEnrolledZips.includes(z.zip));

  const enrolledByState = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    currentEnrolledZips.forEach(zip => {
      const info = zipcodes.lookup(zip);
      const state = info?.state || 'Other';
      if (!grouped[state]) {
        grouped[state] = [];
      }
      grouped[state].push(info || { zip, city: 'Unknown', state });
    });
    return grouped;
  }, [currentEnrolledZips]);

  const toggleZipCode = (zip: string) => {
    let newZips = [...currentEnrolledZips];
    if (newZips.includes(zip)) {
      newZips = newZips.filter(z => z !== zip);
    } else {
      newZips.push(zip);
    }
    setFormData(prev => ({
      ...prev,
      driverProfile: {
        ...prev.driverProfile,
        serviceZipCodes: newZips.join(',')
      }
    }));
  };

  const enrollAllInState = () => {
    let newZips = [...currentEnrolledZips];
    const allStateZips = stateZipData.map((z: any) => z.zip);
    allStateZips.forEach((z: any) => {
      if (!newZips.includes(z)) newZips.push(z);
    });
    setFormData(prev => ({
      ...prev,
      driverProfile: {
        ...prev.driverProfile,
        serviceZipCodes: newZips.join(',')
      }
    }));
  };

  useEffect(() => {
    // 1. Resolve role from JWT
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'DRIVER') {
          setIsDriver(true);
        }
      } catch (e) { }
    }

    // 2. Fetch the actual profile from backend
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.user) {
          const u = res.data.user;
          setFormData((prev) => ({
            ...prev,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            driverProfile: {
              vehicleMake: u.driverProfile?.vehicleMake || '',
              vehicleModel: u.driverProfile?.vehicleModel || '',
              vehicleYear: u.driverProfile?.vehicleYear?.toString() || '',
              licensePlate: u.driverProfile?.licensePlate || '',
              serviceZipCodes: u.driverProfile?.serviceZipCodes || '',
            }
          }));
        }
      } catch (err: any) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (success) {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
      dispatch(resetProfileState());
    }
  }, [success, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      driverProfile: {
        ...formData.driverProfile,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    let year = 0;
    if (isDriver) {
      if (!formData.driverProfile.vehicleMake.trim()) newErrors.vehicleMake = "Vehicle make is required";
      if (!formData.driverProfile.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";

      year = Number(formData.driverProfile.vehicleYear);
      if (!formData.driverProfile.vehicleYear) {
        newErrors.vehicleYear = "Vehicle year is required";
      } else if (isNaN(year) || year < 1980 || year > new Date().getFullYear() + 1) {
        newErrors.vehicleYear = `Enter a valid year between 1980 and ${new Date().getFullYear() + 1}`;
      }

      if (!formData.driverProfile.licensePlate.trim()) newErrors.licensePlate = "License plate is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    };

    if (isDriver) {
      payload.driverProfile = {
        vehicleMake: formData.driverProfile.vehicleMake,
        vehicleModel: formData.driverProfile.vehicleModel,
        vehicleYear: year,
        licensePlate: formData.driverProfile.licensePlate,
        serviceZipCodes: formData.driverProfile.serviceZipCodes
      };
    }

    dispatch(updateProfileRequest(payload));
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        newErrors.newPassword = "Min 8 chars, 1 letter, 1 number, 1 special character";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    dispatch(updatePasswordRequest({
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface px-5 py-6 items-center justify-center pb-24">
        <p className="text-slate-500 font-semibold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface px-5 py-6 overflow-y-auto pb-24">

      {/* Header */}
      <div className="flex justify-center mb-6">
        <h1 className="text-xl font-bold text-text-main">Edit Profile</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-[22px] font-bold text-text-main mb-1">
          {formData.firstName} {formData.lastName}
        </h2>
      </div>

      {/* Form Fields */}
      <form className="space-y-8" onSubmit={handleProfileSave}>

        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-text-main mb-2">
            <User className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Personal Information</span>
          </div>

          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />

          <Input
            label="Email Address"
            name="email"
            value={formData.email}
            disabled
            error={errors.email}
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-100 border-slate-200 text-slate-500"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Vehicle Information (Conditional for Drivers) */}
        {isDriver && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-text-main mb-2">
              <Car className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
              <span className="font-bold text-[15px]">Vehicle Information</span>
            </div>

            <Input
              label="Vehicle Make"
              name="vehicleMake"
              value={formData.driverProfile.vehicleMake}
              onChange={handleDriverChange}
              error={errors.vehicleMake}
              rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 border-slate-200"
            />

            <Input
              label="Vehicle Model"
              name="vehicleModel"
              value={formData.driverProfile.vehicleModel}
              onChange={handleDriverChange}
              error={errors.vehicleModel}
              rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 border-slate-200"
            />

            <Input
              label="Vehicle Year"
              name="vehicleYear"
              type="number"
              value={formData.driverProfile.vehicleYear}
              onChange={handleDriverChange}
              error={errors.vehicleYear}
              rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 border-slate-200"
            />

            <Input
              label="License Plate"
              name="licensePlate"
              value={formData.driverProfile.licensePlate}
              onChange={handleDriverChange}
              error={errors.licensePlate}
              rightIcon={<PenLine className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 border-slate-200"
            />
          </div>
        )}

        {/* Service Area Information (Conditional for Drivers) */}
        {isDriver && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-text-main mb-3">
              <MapPin className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
              <span className="font-bold text-[15px]">Service Area Zones</span>
            </div>

            <p className="text-sm text-slate-500 mb-4 px-1">Select a state below to view and manage your strictly enrolled zip codes.</p>

            <div className="flex space-x-3 mb-5">
              <div className="flex-1 relative">
                <select
                  title="Select State"
                  className="w-full h-[52px] rounded-[14px] bg-slate-50 border border-slate-200 px-4 text-[15px] font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none transition-all cursor-pointer"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setAccordionOpen(true);
                  }}
                >
                  <option value="" className="text-slate-400">Select your state...</option>
                  {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
              <button
                type="button"
                onClick={enrollAllInState}
                disabled={!selectedState}
                className={`h-[52px] px-6 rounded-[14px] text-[14px] font-bold transition-all whitespace-nowrap border-2
                  ${selectedState
                    ? 'bg-primary border-primary text-white flex-shrink-0 hover:bg-primary/90 shadow-md shadow-primary/20'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed flex-shrink-0'}`}
              >
                Enroll All in {selectedState || 'State'}
              </button>
            </div>

            {selectedState && (
              <div className="border-2 border-slate-100 rounded-[16px] overflow-hidden bg-white shadow-sm transition-all duration-200">
                <button
                  type="button"
                  className={`w-full px-5 py-4 flex justify-between items-center transition-all ${accordionOpen ? 'bg-primary/5 border-b border-primary/10' : 'bg-slate-50 hover:bg-slate-100'}`}
                  onClick={() => setAccordionOpen(!accordionOpen)}
                >
                  <span className={`font-bold ${accordionOpen ? 'text-primary' : 'text-slate-700'}`}>
                    {selectedState} Zip Codes
                    <span className="ml-2 inline-flex items-center justify-center bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {enrolledInState.length} Enrolled
                    </span>
                  </span>
                  {accordionOpen ? (
                    <div className="bg-primary/10 p-1 rounded-full"><ChevronDown className="w-5 h-5 text-primary" /></div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {accordionOpen && (
                  <div className="px-5 py-5 max-h-[450px] overflow-y-auto space-y-8 bg-white custom-scrollbar">

                    <div>
                      <h4 className="flex items-center space-x-2 font-bold text-[13px] uppercase tracking-wider text-primary mb-4 sticky top-0 bg-white/95 py-2 z-10 border-b border-primary/10 shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                        <span>Currently Enrolled</span>
                        <span className="text-slate-400 font-medium">({enrolledInState.length})</span>
                      </h4>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {enrolledInState.length === 0 ? (
                          <div className="col-span-full py-4 text-center rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                            <p className="text-sm font-medium text-slate-400">No zip codes enrolled in {selectedState} yet.</p>
                          </div>
                        ) : (
                          enrolledInState.map(item => (
                            <label key={item.zip} className="flex relative items-start space-x-3 cursor-pointer group p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/[0.02] transition-all">
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 rounded-[6px] border-2 border-slate-300 text-primary focus:ring-primary/30 focus:ring-offset-0 transition-all cursor-pointer"
                                  checked={true}
                                  onChange={() => toggleZipCode(item.zip)}
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[14px] font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">
                                  {item.zip}
                                </span>
                                <span className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                                  {item.city}
                                </span>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="flex items-center space-x-2 font-bold text-[13px] uppercase tracking-wider text-slate-500 mb-4 sticky top-0 bg-white/95 py-2 z-10 border-b border-slate-100 shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                        <span>Available To Enroll</span>
                        <span className="text-slate-400 font-medium">({unenrolledInState.length})</span>
                      </h4>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {unenrolledInState.slice(0, 100).map(item => (
                          <label key={item.zip} className="flex relative items-start space-x-3 cursor-pointer group p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/40 hover:bg-primary/[0.02] transition-all shadow-sm">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded-[6px] border-2 border-slate-300 text-primary focus:ring-primary/30 focus:ring-offset-0 transition-all cursor-pointer"
                                checked={false}
                                onChange={() => toggleZipCode(item.zip)}
                              />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[14px] font-bold text-slate-700 group-hover:text-primary transition-colors leading-tight">
                                {item.zip}
                              </span>
                              <span className="text-[12px] font-medium text-slate-400 truncate mt-0.5">
                                {item.city}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {unenrolledInState.length > 100 && (
                        <div className="mt-6 py-5 px-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
                          <p className="text-sm font-semibold text-primary mb-1">
                            +{unenrolledInState.length - 100} more zip codes exist in {selectedState}.
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            Use the <span className="text-primary font-bold px-1">Enroll All</span> button above to quickly add them to your service area!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Save Profile Details Button */}
        <div className="pt-2">
          <Button type="submit" isLoading={saving} size="lg" className="w-full text-[15px] font-semibold">
            Save Profile Details
          </Button>
        </div>
      </form>

      <div className="h-px bg-slate-200 my-8 w-full block"></div>

      {/* Enrolled Zip Codes by State */}
      {isDriver && currentEnrolledZips.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-2 text-text-main mb-4">
            <MapPin className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Currently Enrolled Zones</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(enrolledByState).map(([state, zips]) => (
              <div key={state} className="border border-slate-200 rounded-[14px] bg-slate-50 overflow-hidden">
                <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">{state} Zip Codes</span>
                  <span className="bg-primary/10 text-primary text-[12px] font-bold px-2 py-0.5 rounded-full">
                    {zips.length} Enrolled
                  </span>
                </div>
                <div className="p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {zips.map((info: any) => (
                      <div key={info.zip} className="bg-white border border-slate-200 rounded-[8px] px-2.5 py-1.5 text-[13px] flex items-center space-x-2 shadow-sm">
                        <span className="font-bold text-slate-700">{info.zip}</span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[80px]">{info.city}</span>
                        <button
                          type="button"
                          onClick={() => toggleZipCode(info.zip)}
                          className="w-5 h-5 rounded-full bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary flex items-center justify-center transition-colors ml-1"
                          title={`Unenroll ${info.zip}`}
                        >
                          <span className="text-lg leading-none mb-[2px]">&times;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isDriver && currentEnrolledZips.length > 0 && (
        <div className="h-px bg-slate-200 my-8 w-full block"></div>
      )}

      <form className="space-y-8" onSubmit={handlePasswordSave}>
        {/* Security section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-text-main mb-2">
            <Shield className="w-[18px] h-[18px] stroke-[2.5px] text-primary" />
            <span className="font-bold text-[15px]">Security Settings</span>
          </div>

          <Input
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            type="password"
            placeholder="Enter your current password"
            className="bg-slate-50 border-slate-200"
          />

          <Input
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            type="password"
            placeholder="Enter a new password"
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Update Password Button */}
        <div className="pt-2">
          <Button type="submit" isLoading={saving} size="lg" variant="outline" className="w-full text-[15px] font-semibold border-2">
            Update Password
          </Button>
        </div>
      </form>

      {!isDriver && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full h-14 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-[15px] font-bold rounded-xl flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5 stroke-[2.5px]" />
            <span>Sign Out</span>
          </Button>
        </div>
      )}
    </div>
  );
}
