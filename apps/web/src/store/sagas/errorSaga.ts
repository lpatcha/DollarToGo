import { takeEvery, put } from 'redux-saga/effects';
import { showNotification } from '../slices/uiSlice';

/**
 * Watcher saga that catches ANY action ending in 'Failure'
 * and automatically triggers the Global Notification banner.
 */
function* handleGlobalErrors(action: any) {
  if (action.type.endsWith('Failure') && action.payload) {
    yield put(showNotification({ 
      message: action.payload, 
      severity: 'error' 
    }));
  }
}

export default function* errorSaga() {
  yield takeEvery((action: any) => action.type.endsWith('Failure'), handleGlobalErrors);
}
