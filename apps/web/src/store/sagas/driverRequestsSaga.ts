import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import {
  acceptRequestRequest,
  acceptRequestSuccess,
  acceptRequestFailure,
  declineRequestRequest,
  declineRequestSuccess,
  declineRequestFailure,
  completeRideRequest,
  completeRideSuccess,
  completeRideFailure
} from '../slices/driverRequestsSlice';
import { showNotification } from '../slices/uiSlice';

function* handleAcceptRequest(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(api.post, `/driver/requests/${action.payload}/accept`);
    yield put(acceptRequestSuccess());
    yield put(showNotification({ message: 'Ride request accepted successfully!', severity: 'success' }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to accept ride request.';
    // Dispatch Failure so errorSaga automatically catches it and pops up the alert
    yield put(acceptRequestFailure(errorMessage));
  }
}

function* handleDeclineRequest(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(api.put, `/driver/rides/${action.payload}/cancel`);
    yield put(declineRequestSuccess());
    // Also use global notification to inform driver it was successfully declined or cancelled
    yield put(showNotification({ message: 'Ride successfully cancelled/declined.', severity: 'info' }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to decline ride request.';
    // Dispatch Failure so errorSaga automatically catches it
    yield put(declineRequestFailure(errorMessage));
  }
}

function* handleCompleteRide(action: PayloadAction<{ rideId: string, rating: { score: number, comment?: string } }>): Generator<any, void, any> {
  try {
    const { rideId, rating } = action.payload;
    yield call(api.put, `/driver/rides/${rideId}/complete`, rating);
    yield put(completeRideSuccess());
    yield put(showNotification({ message: 'Ride completed successfully! Great job!', severity: 'success' }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to complete ride.';
    yield put(completeRideFailure(errorMessage));
  }
}

export default function* driverRequestsSaga() {
  yield takeLatest(acceptRequestRequest.type, handleAcceptRequest);
  yield takeLatest(declineRequestRequest.type, handleDeclineRequest);
  yield takeLatest(completeRideRequest.type, handleCompleteRide);
}
