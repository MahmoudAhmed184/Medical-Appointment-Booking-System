import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDoctorProfileApi,
    updateDoctorProfileApi,
} from '../../features/doctor/services/doctorApi';

export const fetchDoctorProfile = createAsyncThunk(
    'doctorProfile/fetchDoctorProfile',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getDoctorProfileApi();
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to load profile'
            );
        }
    }
);

export const updateDoctorProfile = createAsyncThunk(
    'doctorProfile/updateDoctorProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const { data } = await updateDoctorProfileApi(profileData);
            try {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                if (profileData.name) user.name = profileData.name;
                if (profileData.email) user.email = profileData.email;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('user-updated'));
            } catch { /* ignore localStorage errors */ }
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.response?.data?.error?.message ||
                'Failed to update profile'
            );
        }
    }
);

const doctorProfileSlice = createSlice({
    name: 'doctorProfile',
    initialState: {
        profile: null,
        loading: false,
        error: null,
        saving: false,
        saveError: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
            state.saveError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctorProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchDoctorProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateDoctorProfile.pending, (state) => {
                state.saving = true;
                state.saveError = null;
            })
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                state.saving = false;
                state.profile = action.payload;
            })
            .addCase(updateDoctorProfile.rejected, (state, action) => {
                state.saving = false;
                state.saveError = action.payload;
            });
    },
});

export const { clearError } = doctorProfileSlice.actions;
export default doctorProfileSlice.reducer;
