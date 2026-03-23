import { combineReducers, Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import profileReducer from './slices/profileSlice';
import driverRequestsReducer from './slices/driverRequestsSlice';

const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  profile: profileReducer,
  driverRequests: driverRequestsReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: Action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
export default rootReducer;
