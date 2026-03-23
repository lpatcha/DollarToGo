import { call, put, takeLatest } from 'redux-saga/effects';
import { 
  updateProfileRequest, 
  updateProfileSuccess, 
  updateProfileFailure,
  updatePasswordRequest,
  updatePasswordSuccess,
  updatePasswordFailure
} from '../slices/profileSlice';
import { showNotification } from '../slices/uiSlice';
import api from '@/lib/api';
import { PayloadAction } from '@reduxjs/toolkit';

function* handleUpdateProfile(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    yield call(api.put, '/users/profile', action.payload);
    yield put(updateProfileSuccess());
    yield put(showNotification({ message: 'Profile updated successfully!', severity: 'success' }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
    // Dispatch Failure so errorSaga automatically pops up the alert!
    yield put(updateProfileFailure(errorMessage));
  }
}

function* handleUpdatePassword(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    yield call(api.put, '/users/profile/password', action.payload);
    yield put(updatePasswordSuccess());
    yield put(showNotification({ message: 'Password updated successfully!', severity: 'success' }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update password. Please try again.';
    // Dispatch Failure so errorSaga automatically pops up the alert!
    yield put(updatePasswordFailure(errorMessage));
  }
}

export default function* profileSaga() {
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
  yield takeLatest(updatePasswordRequest.type, handleUpdatePassword);
}
