import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import patientDoctorsReducer from './slices/patientDoctorsSlice';
import patientBookingReducer from './slices/patientBookingSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import adminSpecialtiesReducer from './slices/adminSpecialtiesSlice';
import adminAppointmentsReducer from './slices/adminAppointmentsSlice';
import doctorAppointmentsReducer from './slices/doctorAppointmentsSlice';
import doctorAvailabilityReducer from './slices/doctorAvailabilitySlice';
import doctorProfileReducer from './slices/doctorProfileSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer,
        patientDoctors: patientDoctorsReducer,
        patientBooking: patientBookingReducer,
        adminUsers: adminUsersReducer,
        adminSpecialties: adminSpecialtiesReducer,
        adminAppointments: adminAppointmentsReducer,
        doctorAppointments: doctorAppointmentsReducer,
        doctorAvailability: doctorAvailabilityReducer,
        doctorProfile: doctorProfileReducer,
    },
});
