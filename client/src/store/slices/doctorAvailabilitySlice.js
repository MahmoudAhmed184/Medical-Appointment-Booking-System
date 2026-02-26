import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAvailabilityApi,
    setAvailabilityApi,
    updateAvailabilitySlotApi,
    deleteAvailabilitySlotApi,
} from '../../features/doctor/services/doctorApi';

export const fetchAvailability = createAsyncThunk(
    'doctorAvailability/fetchAvailability',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getAvailabilityApi();
            return data.data || [];
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to load availability'
            );
        }
    }
);

export const addAvailabilitySlot = createAsyncThunk(
    'doctorAvailability/addAvailabilitySlot',
    async (slotData, { rejectWithValue }) => {
        try {
            const { data } = await setAvailabilityApi(slotData);
            if (data.success) return data.data;
            return rejectWithValue(data.message || 'Failed to add slot');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to add slot'
            );
        }
    }
);

export const updateAvailabilitySlot = createAsyncThunk(
    'doctorAvailability/updateAvailabilitySlot',
    async ({ slotId, updates }, { rejectWithValue }) => {
        try {
            const { data } = await updateAvailabilitySlotApi(slotId, updates);
            if (data.success) return data.data;
            return rejectWithValue(data.message || 'Failed to update slot');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to update slot'
            );
        }
    }
);

export const deleteAvailabilitySlot = createAsyncThunk(
    'doctorAvailability/deleteAvailabilitySlot',
    async (slotId, { rejectWithValue }) => {
        try {
            const { data } = await deleteAvailabilitySlotApi(slotId);
            if (data.success) return slotId;
            return rejectWithValue(data.message || 'Failed to delete slot');
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete slot'
            );
        }
    }
);

const doctorAvailabilitySlice = createSlice({
    name: 'doctorAvailability',
    initialState: {
        slots: [],
        loading: false,
        error: null,
        formLoading: false,
        formError: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
            state.formError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAvailability.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAvailability.fulfilled, (state, action) => {
                state.loading = false;
                state.slots = action.payload;
            })
            .addCase(fetchAvailability.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addAvailabilitySlot.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(addAvailabilitySlot.fulfilled, (state, action) => {
                state.formLoading = false;
                state.slots.push(action.payload);
            })
            .addCase(addAvailabilitySlot.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })

            .addCase(updateAvailabilitySlot.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(updateAvailabilitySlot.fulfilled, (state, action) => {
                state.formLoading = false;
                const idx = state.slots.findIndex((s) => s._id === action.payload._id);
                if (idx !== -1) state.slots[idx] = action.payload;
            })
            .addCase(updateAvailabilitySlot.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })

            .addCase(deleteAvailabilitySlot.pending, (state) => {
                state.formLoading = true;
            })
            .addCase(deleteAvailabilitySlot.fulfilled, (state, action) => {
                state.formLoading = false;
                state.slots = state.slots.filter((s) => s._id !== action.payload);
            })
            .addCase(deleteAvailabilitySlot.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            });
    },
});

export const { clearError } = doctorAvailabilitySlice.actions;
export default doctorAvailabilitySlice.reducer;
