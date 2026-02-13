import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    appointments: [],
    currentAppointment: null,
    loading: false,
    error: null,
    pagination: null,
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        // TODO: Implement setLoading, setAppointments, setCurrentAppointment, setError, clearAppointments
    },
});

export const { } = appointmentSlice.actions;
export default appointmentSlice.reducer;
