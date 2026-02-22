import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedDate: '',
    selectedTime: '',
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
    setShowSlots,
    setShowConfirmModal,
    resetBookingState,
} = patientBookingSlice.actions;

export default patientBookingSlice.reducer;
