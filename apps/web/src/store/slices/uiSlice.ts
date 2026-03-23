import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

export interface UiState extends NotificationState {
  ratingModalOpen: boolean;
  ratingRideId: string | null;
  lastRatedRideId: string | null;
}

const initialState: UiState = {
  open: false,
  message: '',
  severity: 'info',
  ratingModalOpen: false,
  ratingRideId: null,
  lastRatedRideId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{ message: string; severity?: NotificationState['severity'] }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
    },
    hideNotification: (state) => {
      state.open = false;
    },
    openRatingModal: (state, action: PayloadAction<{ rideId: string }>) => {
      state.ratingModalOpen = true;
      state.ratingRideId = action.payload.rideId;
    },
    closeRatingModal: (state) => {
      state.ratingModalOpen = false;
      state.ratingRideId = null;
    },
    markRideAsRated: (state, action: PayloadAction<{ rideId: string }>) => {
      state.lastRatedRideId = action.payload.rideId;
    },
  },
});

export const { showNotification, hideNotification, openRatingModal, closeRatingModal, markRideAsRated } = uiSlice.actions;
export default uiSlice.reducer;
