import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllAppointmentsApi } from '../../features/admin/services/adminApi';

export const fetchAllAppointments = createAsyncThunk(
    'adminAppointments/fetchAllAppointments',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { filters } = getState().adminAppointments;
            const params = {};
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.status) params.status = filters.status;
            if (filters.doctorId) params.doctorId = filters.doctorId;
            if (filters.patientId) params.patientId = filters.patientId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            const { data } = await getAllAppointmentsApi(params);
            return data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch appointments'
            );
        }
    }
);

const adminAppointmentsSlice = createSlice({
    name: 'adminAppointments',
    initialState: {
        appointments: [],
        pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
        loading: false,
        error: null,
        filters: {
            page: 1,
            limit: 10,
            status: '',
            doctorId: '',
            patientId: '',
            startDate: '',
            endDate: '',
        },
    },
    reducers: {
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload, page: 1 };
        },
        setPage(state, action) {
            state.filters.page = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.appointments = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchAllAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, setPage, clearError } = adminAppointmentsSlice.actions;
export default adminAppointmentsSlice.reducer;
