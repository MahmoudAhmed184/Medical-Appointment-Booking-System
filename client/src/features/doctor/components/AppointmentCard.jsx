import { useState } from 'react';
import { FiCalendar, FiClock, FiCheck, FiX, FiEdit } from 'react-icons/fi';
import { getStatusClasses } from '../../../shared/utils/statusBadge';

const BORDER_COLORS = {
    pending: 'border-l-yellow-400',
    confirmed: 'border-l-green-500',
    completed: 'border-l-purple-500',
    cancelled: 'border-l-gray-300',
    rejected: 'border-l-red-500',
};

const AppointmentCard = ({ appointment, onApprove, onReject, onComplete, onSaveNotes }) => {
    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState(appointment.notes || '');
    const [showReason, setShowReason] = useState(false);

    const patientName = appointment.patientId?.userId?.name || appointment.patient?.user?.name || 'Patient';
    const patientEmail = appointment.patientId?.userId?.email || appointment.patient?.user?.email || '';
    const statusStyle = getStatusClasses(appointment.status);
    const borderColor = BORDER_COLORS[appointment.status] || 'border-l-gray-300';

    const handleSaveNotes = async () => {
        if (onSaveNotes) {
            const result = await onSaveNotes(appointment._id, notes);
            if (result?.success) setNotesOpen(false);
        }
    };

    const isPastStartTime = () => {
        if (!appointment.date || !appointment.startTime) return false;
        try {
            const apptDate = new Date(appointment.date);
            const [hours, minutes] = appointment.startTime.split(':').map(Number);
            apptDate.setHours(hours, minutes, 0, 0);
            return new Date() >= apptDate;
        } catch (e) {
            return false;
        }
    };

    const canComplete = isPastStartTime();

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} p-5 mb-3 hover:shadow-md dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all duration-200`}>
                {/* Top: Patient + Status */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
                            {patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{patientName}</p>
                            {patientEmail && <p className="text-xs text-gray-400 dark:text-gray-500">{patientEmail}</p>}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle}`}>
                        {appointment.status}
                    </span>
                </div>

                {/* Date & Time */}
                <div className="flex gap-5 mb-3 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                        <FiCalendar /> {appointment.date
                            ? new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                    </span>
                    <span className="flex items-center gap-2">
                        <FiClock /> {appointment.startTime || '—'} — {appointment.endTime || '—'}
                    </span>
                </div>

                {appointment.reason && (
                    <div className="mb-3">
                        <button
                            onClick={() => setShowReason(!showReason)}
                            className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            Reason {showReason ? '▲' : '▼'}
                        </button>
                        {showReason && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-1">{appointment.reason}</p>
                        )}
                    </div>
                )}

                {/* Notes preview */}
                {appointment.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.notes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap mt-2">
                    {appointment.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onApprove?.(appointment._id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                <FiCheck className="text-lg" /> Approve
                            </button>
                            <button
                                onClick={() => onReject?.(appointment._id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                                <FiX className="text-lg" /> Reject
                            </button>
                        </>
                    )}
                    {appointment.status === 'confirmed' && (
                        <button
                            onClick={() => onComplete?.(appointment._id)}
                            disabled={!canComplete}
                            title={!canComplete ? "Appointment start time has not passed yet" : ""}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-colors ${canComplete ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer' : 'bg-purple-400 cursor-not-allowed opacity-60'}`}
                        >
                            Mark Complete
                        </button>
                    )}
                    {['pending', 'confirmed', 'completed'].includes(appointment.status) && (
                        <button
                            onClick={() => setNotesOpen(true)}
                            className="p-2 rounded-xl text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                            title="Add / Edit Notes"
                        >
                            <FiEdit className="text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Notes Modal */}
            {notesOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setNotesOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Appointment Notes</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Notes for {patientName}&apos;s appointment on {appointment.date ? new Date(appointment.date).toLocaleDateString() : '—'}
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Enter doctor notes here..."
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setNotesOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="px-5 py-2.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppointmentCard;
