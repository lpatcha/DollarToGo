import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DriverRequestsState {
  actionLoading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: DriverRequestsState = {
  actionLoading: false,
  success: false,
  error: null,
};

const driverRequestsSlice = createSlice({
  name: 'driverRequests',
  initialState,
  reducers: {
    acceptRequestRequest(state, action: PayloadAction<string>) {
      state.actionLoading = true;
      state.success = false;
      state.error = null;
    },
    acceptRequestSuccess(state) {
      state.actionLoading = false;
      state.success = true;
    },
    acceptRequestFailure(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.error = action.payload;
    },
    declineRequestRequest(state, action: PayloadAction<string>) {
      state.actionLoading = true;
      state.success = false;
      state.error = null;
    },
    declineRequestSuccess(state) {
      state.actionLoading = false;
      state.success = true;
    },
    declineRequestFailure(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.error = action.payload;
    },
    completeRideRequest(state, action: PayloadAction<{ rideId: string, rating: { score: number, comment?: string } }>) {
      state.actionLoading = true;
      state.success = false;
      state.error = null;
    },
    completeRideSuccess(state) {
      state.actionLoading = false;
      state.success = true;
    },
    completeRideFailure(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.error = action.payload;
    },
    resetActionState(state) {
      state.actionLoading = false;
      state.success = false;
      state.error = null;
    }
  },
});

export const {
  acceptRequestRequest,
  acceptRequestSuccess,
  acceptRequestFailure,
  declineRequestRequest,
  declineRequestSuccess,
  declineRequestFailure,
  completeRideRequest,
  completeRideSuccess,
  completeRideFailure,
  resetActionState,
} = driverRequestsSlice.actions;

export default driverRequestsSlice.reducer;
