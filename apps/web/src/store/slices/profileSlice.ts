import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  loading: boolean;
  success: boolean;
}

const initialState: ProfileState = {
  loading: false,
  success: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfileRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.success = false;
    },
    updateProfileSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.success = false;
    },
    updatePasswordRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.success = false;
    },
    updatePasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updatePasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.success = false;
    },
    resetProfileState: (state) => {
      state.success = false;
    }
  },
});

export const { 
  updateProfileRequest, 
  updateProfileSuccess, 
  updateProfileFailure,
  updatePasswordRequest,
  updatePasswordSuccess,
  updatePasswordFailure,
  resetProfileState
} = profileSlice.actions;

export default profileSlice.reducer;
