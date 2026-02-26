import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAvailability,
    addAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
} from '../../../store/slices/doctorAvailabilitySlice';
import { FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../../shared/hooks/useToast';
import Toast from '../../../shared/components/Toast';

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const DAY_COLORS = {
    0: 'bg-red-500',
    1: 'bg-blue-500',
    2: 'bg-green-500',
    3: 'bg-orange-500',
    4: 'bg-purple-500',
    5: 'bg-cyan-500',
    6: 'bg-pink-500',
};

export default function AvailabilityPage() {
    const dispatch = useDispatch();
    const { slots, loading, error } = useSelector((state) => state.doctorAvailability);
    const [showForm, setShowForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [formData, setFormData] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
    const [formError, setFormError] = useState('');
    const { toast, showToast } = useToast();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        dispatch(fetchAvailability());
    }, [dispatch]);

    const handleOpenAdd = () => {
        setEditingSlot(null);
        setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
        setFormError('');
        setShowForm(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingSlot(slot);
        setFormData({ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime });
        setFormError('');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.startTime || !formData.endTime) {
            setFormError('All fields are required');
            return;
        }
        const [sh, sm] = formData.startTime.split(':').map(Number);
        const [eh, em] = formData.endTime.split(':').map(Number);
        if (eh * 60 + em <= sh * 60 + sm) {
            setFormError('End time must be after start time');
            return;
        }

        let result;
        if (editingSlot) {
            result = await dispatch(updateAvailabilitySlot({
                slotId: editingSlot._id,
                updates: { startTime: formData.startTime, endTime: formData.endTime },
            }));
        } else {
            result = await dispatch(addAvailabilitySlot({
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
            }));
        }

        if (result.meta.requestStatus === 'fulfilled') {
            setShowForm(false);
            showToast(editingSlot ? 'Slot updated successfully' : 'Slot added successfully');
        } else {
            setFormError(result.payload);
        }
    };

    const handleDelete = async () => {
        const result = await dispatch(deleteAvailabilitySlot(deleteConfirm));
        setDeleteConfirm(null);
        if (deleteAvailabilitySlot.fulfilled.match(result)) {
            showToast('Slot deleted', 'success');
        } else {
            showToast(result.payload || 'Failed to delete slot', 'error');
        }
    };

    const slotsByDay = DAYS
        .map((day) => ({
            ...day,
            slots: slots.filter((s) => s.dayOfWeek === day.value).sort((a, b) => a.startTime.localeCompare(b.startTime)),
        }))
        .filter((day) => day.slots.length > 0);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Availability</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Set your weekly schedule so patients can book appointments.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                    <span className="text-lg">+</span> Add Time Slot
                </button>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : slotsByDay.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-16 px-6">
                    <span className="text-6xl flex justify-center mb-4 text-gray-300 dark:text-gray-600"><FiClock /></span>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No availability slots set</h3>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Add your first time slot to start accepting appointments.</p>
                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                    >
                        + Add Time Slot
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {slotsByDay.map((day) => (
                        <div key={day.value} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`${DAY_COLORS[day.value]} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                                    {day.label}
                                </span>
                                <span className="text-sm text-gray-400 dark:text-gray-500">{day.slots.length} {day.slots.length === 1 ? 'slot' : 'slots'}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {day.slots.map((slot) => (
                                    <div
                                        key={slot._id}
                                        className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200 group"
                                    >
                                        <span className="text-blue-500 text-lg"><FiClock /></span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{slot.startTime} — {slot.endTime}</span>
                                        <button
                                            onClick={() => handleOpenEdit(slot)}
                                            className="ml-1 p-1 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="text-lg" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(slot._id)}
                                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="text-lg" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">{formError}</div>
                            )}
                            {!editingSlot && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                                    <select
                                        value={formData.dayOfWeek}
                                        onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        {DAYS.map((d) => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                                >
                                    {editingSlot ? 'Update' : 'Add Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Time Slot?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this availability slot? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast toast={toast} />
        </div>
    );
}
