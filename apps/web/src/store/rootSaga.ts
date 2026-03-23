import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';
import errorSaga from './sagas/errorSaga';
import profileSaga from './sagas/profileSaga';
import driverRequestsSaga from './sagas/driverRequestsSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(errorSaga),
    fork(profileSaga),
    fork(driverRequestsSaga),
  ]);
}
