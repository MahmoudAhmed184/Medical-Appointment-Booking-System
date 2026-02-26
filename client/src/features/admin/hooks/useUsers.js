import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUsers,
    approveUser,
    blockUser,
    deleteUser,
    setFilters,
    setPage,
    clearError,
} from '../../../store/slices/adminUsersSlice';

const useUsers = () => {
    const dispatch = useDispatch();
    const { users, pagination, loading, error, actionLoading, filters } =
        useSelector((state) => state.adminUsers);

    const loadUsers = useCallback(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers, filters]);

    const handleApprove = useCallback(
        (id) => dispatch(approveUser(id)),
        [dispatch]
    );

    const handleBlock = useCallback(
        (id) => dispatch(blockUser(id)),
        [dispatch]
    );

    const handleDelete = useCallback(
        (id) => dispatch(deleteUser(id)),
        [dispatch]
    );

    const handleSetFilters = useCallback(
        (newFilters) => dispatch(setFilters(newFilters)),
        [dispatch]
    );

    const handleSetPage = useCallback(
        (page) => dispatch(setPage(page)),
        [dispatch]
    );

    const handleClearError = useCallback(
        () => dispatch(clearError()),
        [dispatch]
    );

    return {
        users,
        pagination,
        loading,
        error,
        actionLoading,
        filters,
        refetch: loadUsers,
        approveUser: handleApprove,
        blockUser: handleBlock,
        deleteUser: handleDelete,
        setFilters: handleSetFilters,
        setPage: handleSetPage,
        clearError: handleClearError,
    };
};

export default useUsers;
