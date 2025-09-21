import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorsReducer from './slices/doctorsSlice';
import patientsReducer from './slices/patientsSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import servicesReducer from './slices/servicesSlice';
import treatmentsReducer from './slices/treatmentsSlice';
import profileReducer from './slices/profileSlice';
import invoicesReducer from './slices/invoicesSlice';
import expensesReducer from './slices/expensesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  doctors: doctorsReducer,
  patients: patientsReducer,
  appointments: appointmentsReducer,
  services: servicesReducer,
  treatments: treatmentsReducer,
  profile: profileReducer,
  invoices: invoicesReducer,
  expenses: expensesReducer,
});

// Create a wrapper reducer that can reset the entire state
const appReducer = (state: any, action: any) => {
  // Clear all data when logout is fulfilled
  if (action.type === 'auth/logout/fulfilled') {
    state = undefined;
  }
  
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: appReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch; 