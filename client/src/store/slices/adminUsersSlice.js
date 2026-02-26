import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getUsersApi,
    approveUserApi,
    blockUserApi,
    deleteUserApi,
} from '../../features/admin/services/adminApi';

export const fetchUsers = createAsyncThunk(
    'adminUsers/fetchUsers',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { filters } = getState().adminUsers;
            const params = {};
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.role) params.role = filters.role;
            if (filters.isApproved !== '') params.isApproved = filters.isApproved;
            if (filters.search) params.search = filters.search;
            const { data } = await getUsersApi(params);
            return data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to fetch users'
            );
        }
    }
);

export const approveUser = createAsyncThunk(
    'adminUsers/approveUser',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await approveUserApi(id);
            return { id, data };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to approve user'
            );
        }
    }
);

export const blockUser = createAsyncThunk(
    'adminUsers/blockUser',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await blockUserApi(id);
            return { id, data };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to block/unblock user'
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    'adminUsers/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await deleteUserApi(id);
            return id;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Failed to delete user'
            );
        }
    }
);

const adminUsersSlice = createSlice({
    name: 'adminUsers',
    initialState: {
        users: [],
        pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
        loading: false,
        error: null,
        actionLoading: false,
        filters: {
            page: 1,
            limit: 10,
            role: '',
            isApproved: '',
            search: '',
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
            // fetchUsers
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // approveUser
            .addCase(approveUser.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(approveUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                const idx = state.users.findIndex((u) => u._id === action.payload.id);
                if (idx !== -1) {
                    state.users[idx].isApproved = true;
                }
            })
            .addCase(approveUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // blockUser
            .addCase(blockUser.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(blockUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                const idx = state.users.findIndex((u) => u._id === action.payload.id);
                if (idx !== -1) {
                    state.users[idx].isBlocked = !state.users[idx].isBlocked;
                }
            })
            .addCase(blockUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // deleteUser
            .addCase(deleteUser.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.users = state.users.filter((u) => u._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, setPage, clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
