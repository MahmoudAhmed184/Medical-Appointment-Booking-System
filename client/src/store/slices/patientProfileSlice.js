import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profile: {
        firstName: 'Alex',
        lastName: 'Johnson',
        dob: '1988-05-12',
        gender: 'Male',
        email: 'alex.johnson@example.com',
        phone: '+1 (555) 123-4567',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4QC2t-RpKpqzFlMoeaK2ad5yaX3RAw6bdlg_ztmKFpFzOWwLg6N0yseV9ENOvCcYNMS7zrF2OWBJ-KhLlu1fUlXtyB4M4p19T80sTlKSejetxoD1Igc5m082lHDPqB-AJYwDHuGvsWrFhLHBapP6XJ-lFD7tzYTMU9NPpGJQDLpQgp-pEVU4rIj2fAMf6yZvBDHTeLmXS0eySF-56kcoP_ZhwFh6eeo1SodZl6AL7SGB8X-rWCtDMZ9bstzQM8S8jxKZjP11Ouw',
    },
    editingField: null,
    tempValue: '',
};

const patientProfileSlice = createSlice({
    name: 'patientProfile',
    initialState,
    reducers: {
        startEditField: (state, action) => {
            const field = action.payload;
            state.editingField = field;
            state.tempValue = state.profile[field] ?? '';
        },
        setTempValue: (state, action) => {
            state.tempValue = action.payload;
        },
        saveField: (state, action) => {
            const field = action.payload;
            state.profile[field] = state.tempValue;
            state.editingField = null;
        },
        cancelEditField: (state) => {
            state.editingField = null;
            state.tempValue = '';
        },
    },
});

export const { startEditField, setTempValue, saveField, cancelEditField } =
    patientProfileSlice.actions;

export default patientProfileSlice.reducer;
