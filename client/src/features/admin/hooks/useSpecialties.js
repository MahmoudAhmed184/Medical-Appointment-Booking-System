import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    clearError,
} from '../../../store/slices/adminSpecialtiesSlice';

const useSpecialties = () => {
    const dispatch = useDispatch();
    const { specialties, loading, error, formLoading, formError } = useSelector(
        (state) => state.adminSpecialties
    );

    const loadSpecialties = useCallback(() => {
        dispatch(fetchSpecialties());
    }, [dispatch]);

    useEffect(() => {
        loadSpecialties();
    }, [loadSpecialties]);

    const handleCreate = useCallback(
        (data) => dispatch(createSpecialty(data)).unwrap(),
        [dispatch]
    );

    const handleUpdate = useCallback(
        (id, data) => dispatch(updateSpecialty({ id, data })).unwrap(),
        [dispatch]
    );

    const handleDelete = useCallback(
        (id) => dispatch(deleteSpecialty(id)).unwrap(),
        [dispatch]
    );

    const handleClearError = useCallback(
        () => dispatch(clearError()),
        [dispatch]
    );

    return {
        specialties,
        loading,
        error,
        formLoading,
        formError,
        refetch: loadSpecialties,
        createSpecialty: handleCreate,
        updateSpecialty: handleUpdate,
        deleteSpecialty: handleDelete,
        clearError: handleClearError,
    };
};

export default useSpecialties;
