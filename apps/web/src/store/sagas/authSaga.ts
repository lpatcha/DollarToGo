import { call, put, takeLatest } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../slices/authSlice';
import api from '@/lib/api';
import { PayloadAction } from '@reduxjs/toolkit';

function* handleLogin(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response = yield call(api.post, '/auth/login', action.payload);
    const { user, token } = response.data;

    yield put(loginSuccess({ user, token }));

    // Redirect logic would go here, e.g., using router.push
    if (typeof window !== 'undefined') {
      window.location.href = user.role === 'DRIVER' ? '/requests' : '/dashboard';
    }
  } catch (error: any) {
    if (error.response?.status === 403 && error.response?.data?.requiresActivation) {
      if (typeof window !== 'undefined') {
        const email = error.response.data.email;
        window.location.href = `/activate?email=${encodeURIComponent(email)}&status=inactive`;
      }
      return;
    }
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    yield put(loginFailure(errorMessage));
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
}
