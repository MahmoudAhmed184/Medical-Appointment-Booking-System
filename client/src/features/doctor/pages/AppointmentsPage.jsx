import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDoctorAppointments,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    saveAppointmentNotes,
} from '../../../store/slices/doctorAppointmentsSlice';
import AppointmentCard from '../components/AppointmentCard';
import { useToast } from '../../../shared/hooks/useToast';
import Toast from '../../../shared/components/Toast';

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Rejected', value: 'rejected' },
];

export default function AppointmentsPage() {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector((state) => state.doctorAppointments);
    const [activeTab, setActiveTab] = useState('all');
    const { toast, showToast } = useToast();

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    const filteredAppointments = activeTab === 'all'
        ? appointments
        : appointments.filter((a) => a.status === activeTab);

    const handleAction = async (action, id) => {
        const thunks = { approve: approveAppointment, reject: rejectAppointment, complete: completeAppointment };
        const thunk = thunks[action];
        if (!thunk) return;

        const result = await dispatch(thunk(id));
        if (thunk.fulfilled.match(result)) {
            showToast(`Appointment ${action}d successfully`, 'success');
        } else {
            showToast(result.payload || `Failed to ${action}`, 'error');
        }
    };

    const handleSaveNotes = async (id, notes) => {
        const result = await dispatch(saveAppointmentNotes({ id, notes }));
        if (saveAppointmentNotes.fulfilled.match(result)) {
            showToast('Notes saved successfully', 'success');
            return { success: true };
        }
        showToast(result.payload || 'Failed to save notes', 'error');
        return { success: false };
    };

    const statusCounts = {
        all: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
        cancelled: appointments.filter((a) => a.status === 'cancelled').length,
        rejected: appointments.filter((a) => a.status === 'rejected').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your patient appointments — approve, reject, complete, and add notes.</p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">{error}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-200 dark:border-gray-700">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer
                            ${activeTab === tab.value
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                            ${activeTab === tab.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                            {statusCounts[tab.value]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-16">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        No {activeTab === 'all' ? '' : activeTab} appointments
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {activeTab === 'all'
                            ? "You don't have any appointments yet."
                            : `No appointments with "${activeTab}" status.`}
                    </p>
                </div>
            ) : (
                filteredAppointments
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((appt) => (
                        <AppointmentCard
                            key={appt._id}
                            appointment={appt}
                            onApprove={(id) => handleAction('approve', id)}
                            onReject={(id) => handleAction('reject', id)}
                            onComplete={(id) => handleAction('complete', id)}
                            onSaveNotes={handleSaveNotes}
                        />
                    ))
            )}

            <Toast toast={toast} />
        </div>
    );
}
