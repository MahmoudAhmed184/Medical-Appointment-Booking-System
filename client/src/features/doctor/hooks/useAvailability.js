import { useState, useEffect, useCallback } from 'react';
import {
    getAvailabilityApi,
    setAvailabilityApi,
    updateAvailabilitySlotApi,
    deleteAvailabilitySlotApi,
} from '../services/doctorApi';

const useAvailability = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getAvailabilityApi();
            setSlots(data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load availability');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const addSlot = async (slotData) => {
        try {
            const { data } = await setAvailabilityApi(slotData);
            if (data.success) {
                setSlots((prev) => [...prev, data.data]);
                return { success: true };
            }
            return { success: false, message: data.message || 'Failed to add slot' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add slot';
            return { success: false, message: msg };
        }
    };

    const updateSlot = async (slotId, updates) => {
        try {
            const { data } = await updateAvailabilitySlotApi(slotId, updates);
            if (data.success) {
                setSlots((prev) =>
                    prev.map((s) => (s._id === slotId ? data.data : s))
                );
                return { success: true };
            }
            return { success: false, message: data.message || 'Failed to update slot' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update slot';
            return { success: false, message: msg };
        }
    };

    const removeSlot = async (slotId) => {
        try {
            const { data } = await deleteAvailabilitySlotApi(slotId);
            if (data.success) {
                setSlots((prev) => prev.filter((s) => s._id !== slotId));
                return { success: true };
            }
            return { success: false, message: data.message || 'Failed to delete slot' };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete slot';
            return { success: false, message: msg };
        }
    };

    return { slots, loading, error, fetchSlots, addSlot, updateSlot, removeSlot };
};

export default useAvailability;
