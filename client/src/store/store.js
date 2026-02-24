import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import patientDoctorsReducer from './slices/patientDoctorsSlice';
import patientBookingReducer from './slices/patientBookingSlice';
import patientProfileReducer from './slices/patientProfileSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer,
        patientDoctors: patientDoctorsReducer,
        patientBooking: patientBookingReducer,
        patientProfile: patientProfileReducer,
    },
});
