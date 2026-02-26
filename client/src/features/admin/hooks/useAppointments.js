import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllAppointments,
    setFilters,
    setPage,
    clearError,
} from '../../../store/slices/adminAppointmentsSlice';

const useAppointments = () => {
    const dispatch = useDispatch();
    const { appointments, pagination, loading, error, filters } = useSelector(
        (state) => state.adminAppointments
    );

    const loadAppointments = useCallback(() => {
        dispatch(fetchAllAppointments());
    }, [dispatch]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments, filters]);

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
        appointments,
        pagination,
        loading,
        error,
        filters,
        refetch: loadAppointments,
        setFilters: handleSetFilters,
        setPage: handleSetPage,
        clearError: handleClearError,
    };
};

export default useAppointments;
