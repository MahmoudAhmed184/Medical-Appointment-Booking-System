import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // TODO: Implement loginStart, loginSuccess, loginFailure, logout, clearError
    },
});

export const { } = authSlice.actions;
export default authSlice.reducer;
