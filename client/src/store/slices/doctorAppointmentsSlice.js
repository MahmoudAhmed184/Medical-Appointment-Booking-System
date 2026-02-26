import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDoctorAppointmentsApi,
    approveAppointmentApi,
    rejectAppointmentApi,
    completeAppointmentApi,
    addNotesApi,
} from '../../features/doctor/services/doctorApi';

export const fetchDoctorAppointments = createAsyncThunk(
    'doctorAppointments/fetchDoctorAppointments',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getDoctorAppointmentsApi();
            return data.data || [];
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to load appointments'
            );
        }
    }
);

export const approveAppointment = createAsyncThunk(
    'doctorAppointments/approveAppointment',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await approveAppointmentApi(id);
            if (data.success) return id;
            return rejectWithValue(data.message || 'Failed to approve');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to approve'
            );
        }
    }
);

export const rejectAppointment = createAsyncThunk(
    'doctorAppointments/rejectAppointment',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await rejectAppointmentApi(id);
            if (data.success) return id;
            return rejectWithValue(data.message || 'Failed to reject');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to reject'
            );
        }
    }
);

export const completeAppointment = createAsyncThunk(
    'doctorAppointments/completeAppointment',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await completeAppointmentApi(id);
            if (data.success) return id;
            return rejectWithValue(data.message || 'Failed to complete');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to complete'
            );
        }
    }
);

export const saveAppointmentNotes = createAsyncThunk(
    'doctorAppointments/saveAppointmentNotes',
    async ({ id, notes }, { rejectWithValue }) => {
        try {
            const { data } = await addNotesApi(id, notes);
            if (data.success) return { id, notes };
            return rejectWithValue(data.message || 'Failed to save notes');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to save notes'
            );
        }
    }
);

const doctorAppointmentsSlice = createSlice({
    name: 'doctorAppointments',
    initialState: {
        appointments: [],
        loading: false,
        error: null,
        actionLoading: false,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctorAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments = action.payload;
            })
            .addCase(fetchDoctorAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(approveAppointment.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(approveAppointment.fulfilled, (state, action) => {
                state.actionLoading = false;
                const appt = state.appointments.find((a) => a._id === action.payload);
                if (appt) appt.status = 'confirmed';
            })
            .addCase(approveAppointment.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            .addCase(rejectAppointment.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(rejectAppointment.fulfilled, (state, action) => {
                state.actionLoading = false;
                const appt = state.appointments.find((a) => a._id === action.payload);
                if (appt) appt.status = 'rejected';
            })
            .addCase(rejectAppointment.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            .addCase(completeAppointment.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(completeAppointment.fulfilled, (state, action) => {
                state.actionLoading = false;
                const appt = state.appointments.find((a) => a._id === action.payload);
                if (appt) appt.status = 'completed';
            })
            .addCase(completeAppointment.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            .addCase(saveAppointmentNotes.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(saveAppointmentNotes.fulfilled, (state, action) => {
                state.actionLoading = false;
                const appt = state.appointments.find((a) => a._id === action.payload.id);
                if (appt) appt.notes = action.payload.notes;
            })
            .addCase(saveAppointmentNotes.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = doctorAppointmentsSlice.actions;
export default doctorAppointmentsSlice.reducer;
