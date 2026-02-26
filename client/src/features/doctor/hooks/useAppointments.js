import { useState, useEffect, useCallback } from 'react';
import {
    getDoctorAppointmentsApi,
    approveAppointmentApi,
    rejectAppointmentApi,
    completeAppointmentApi,
    addNotesApi,
} from '../services/doctorApi';

const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getDoctorAppointmentsApi();
            setAppointments(data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const approve = async (id) => {
        try {
            const { data } = await approveAppointmentApi(id);
            if (data.success) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id ? { ...a, status: 'confirmed' } : a))
                );
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to approve' };
        }
    };

    const reject = async (id) => {
        try {
            const { data } = await rejectAppointmentApi(id);
            if (data.success) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id ? { ...a, status: 'rejected' } : a))
                );
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to reject' };
        }
    };

    const complete = async (id) => {
        try {
            const { data } = await completeAppointmentApi(id);
            if (data.success) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id ? { ...a, status: 'completed' } : a))
                );
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to complete' };
        }
    };

    const saveNotes = async (id, notes) => {
        try {
            const { data } = await addNotesApi(id, notes);
            if (data.success) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id ? { ...a, notes } : a))
                );
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to save notes' };
        }
    };

    return {
        appointments,
        loading,
        error,
        fetchAppointments,
        approve,
        reject,
        complete,
        saveNotes,
    };
};

export default useAppointments;
