import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerApi } from '../../features/auth/services/authApi';

/* ---------- helpers to hydrate from localStorage ---------- */
const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
})();
const storedToken = localStorage.getItem('token') || null;

/* ---------- initial state ---------- */
const initialState = {
    user: storedUser,
    token: storedToken,
    loading: false,
    error: null,
};

/* ---------- Extract detailed error from API response ---------- */
const extractError = (err, fallback) => {
    const serverError = err.response?.data?.error;
    if (serverError?.details?.length) {
        return serverError.details.map((d) => `${d.field}: ${d.message}`).join('\n');
    }
    return serverError?.message || err.response?.data?.message || fallback;
};

/* ---------- async thunks ---------- */
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await loginApi(credentials);
            const { token, user } = data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('user-updated'));
            return { token, user };
        } catch (err) {
            return rejectWithValue(extractError(err, 'Login failed'));
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await registerApi(formData);
            const { token, user } = data.data || {};
            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('user-updated'));
            }
            return { token: token || null, user: user || null };
        } catch (err) {
            return rejectWithValue(extractError(err, 'Registration failed'));
        }
    }
);

/* ---------- slice ---------- */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action) {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        },
        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('user-updated'));
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
