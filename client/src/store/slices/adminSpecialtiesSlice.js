import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getSpecialtiesApi,
    createSpecialtyApi,
    updateSpecialtyApi,
    deleteSpecialtyApi,
} from '../../features/admin/services/adminApi';

export const fetchSpecialties = createAsyncThunk(
    'adminSpecialties/fetchSpecialties',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getSpecialtiesApi();
            return data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch specialties'
            );
        }
    }
);

export const createSpecialty = createAsyncThunk(
    'adminSpecialties/createSpecialty',
    async (specialtyData, { rejectWithValue }) => {
        try {
            const { data } = await createSpecialtyApi(specialtyData);
            return data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to create specialty'
            );
        }
    }
);

export const updateSpecialty = createAsyncThunk(
    'adminSpecialties/updateSpecialty',
    async ({ id, data: specialtyData }, { rejectWithValue }) => {
        try {
            const { data } = await updateSpecialtyApi(id, specialtyData);
            return { id, data };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to update specialty'
            );
        }
    }
);

export const deleteSpecialty = createAsyncThunk(
    'adminSpecialties/deleteSpecialty',
    async (id, { rejectWithValue }) => {
        try {
            await deleteSpecialtyApi(id);
            return id;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete specialty'
            );
        }
    }
);

const adminSpecialtiesSlice = createSlice({
    name: 'adminSpecialties',
    initialState: {
        specialties: [],
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
            // fetchSpecialties
            .addCase(fetchSpecialties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpecialties.fulfilled, (state, action) => {
                state.loading = false;
                state.specialties = action.payload.data || [];
            })
            .addCase(fetchSpecialties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // createSpecialty
            .addCase(createSpecialty.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(createSpecialty.fulfilled, (state, action) => {
                state.formLoading = false;
                state.specialties.push(action.payload.data);
            })
            .addCase(createSpecialty.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })
            // updateSpecialty
            .addCase(updateSpecialty.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(updateSpecialty.fulfilled, (state, action) => {
                state.formLoading = false;
                const idx = state.specialties.findIndex(
                    (s) => s._id === action.payload.id
                );
                if (idx !== -1) {
                    state.specialties[idx] = action.payload.data.data || action.payload.data;
                }
            })
            .addCase(updateSpecialty.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })
            // deleteSpecialty
            .addCase(deleteSpecialty.pending, (state) => {
                state.formLoading = true;
            })
            .addCase(deleteSpecialty.fulfilled, (state, action) => {
                state.formLoading = false;
                state.specialties = state.specialties.filter(
                    (s) => s._id !== action.payload
                );
            })
            .addCase(deleteSpecialty.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            });
    },
});

export const { clearError } = adminSpecialtiesSlice.actions;
export default adminSpecialtiesSlice.reducer;
