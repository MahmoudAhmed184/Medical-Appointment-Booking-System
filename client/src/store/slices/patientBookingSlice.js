import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedDate: '',
    selectedTime: '',
    selectedStartTime: '',
    selectedEndTime: '',
    reason: '',
    showSlots: false,
    showConfirmModal: false,
};

const patientBookingSlice = createSlice({
    name: 'patientBooking',
    initialState,
    reducers: {
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
        setSelectedTime: (state, action) => {
            state.selectedTime = action.payload;
        },
        setSelectedStartTime: (state, action) => {
            state.selectedStartTime = action.payload;
        },
        setSelectedEndTime: (state, action) => {
            state.selectedEndTime = action.payload;
        },
        setReason: (state, action) => {
            state.reason = action.payload;
        },
        setShowSlots: (state, action) => {
            state.showSlots = action.payload;
        },
        setShowConfirmModal: (state, action) => {
            state.showConfirmModal = action.payload;
        },
        resetBookingState: () => initialState,
    },
});

export const {
    setSelectedDate,
    setSelectedTime,
    setSelectedStartTime,
    setSelectedEndTime,
    setReason,
    setShowSlots,
    setShowConfirmModal,
    resetBookingState,
} = patientBookingSlice.actions;

export default patientBookingSlice.reducer;
