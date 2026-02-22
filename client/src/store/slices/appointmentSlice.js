import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    cancelAppointmentApi,
    getMyAppointmentsApi,
    rescheduleAppointmentApi,
} from '../../features/patient/services/patientApi';

export const fetchMyAppointments = createAsyncThunk(
    'appointments/fetchMyAppointments',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getMyAppointmentsApi();
            return data?.appointments || [];
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to load appointments'
            );
        }
    }
);

export const cancelAppointment = createAsyncThunk(
    'appointments/cancelAppointment',
    async (id, { rejectWithValue }) => {
        try {
            await cancelAppointmentApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to cancel appointment'
            );
        }
    }
);

export const rescheduleAppointment = createAsyncThunk(
    'appointments/rescheduleAppointment',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            await rescheduleAppointmentApi(id, payload);
            return { id, payload };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to reschedule appointment'
            );
        }
    }
);

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
        clearAppointmentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments = action.payload;
            })
            .addCase(fetchMyAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(cancelAppointment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelAppointment.fulfilled, (state, action) => {
                state.loading = false;
                const appt = state.appointments.find((a) => a._id === action.payload);
                if (appt) appt.status = 'cancelled';
            })
            .addCase(cancelAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(rescheduleAppointment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rescheduleAppointment.fulfilled, (state, action) => {
                state.loading = false;
                const { id, payload } = action.payload || {};
                const appt = state.appointments.find((a) => a._id === id);
                if (appt && payload) {
                    appt.date = payload.date;
                    appt.startTime = payload.startTime;
                    appt.endTime = payload.endTime;
                    appt.status = 'pending';
                }
            })
            .addCase(rescheduleAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
