import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiClipboard, FiClock, FiCheckCircle, FiAward, FiCalendar } from 'react-icons/fi';
import { getStatusClasses } from '../../../shared/utils/statusBadge';
import { fetchDoctorAppointments } from '../../../store/slices/doctorAppointmentsSlice';

const STAT_CARDS = [
    { key: 'total', label: 'Total Appointments', icon: <FiClipboard />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40', border: 'border-blue-100 dark:border-blue-800' },
    { key: 'pending', label: 'Pending', icon: <FiClock />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/40', border: 'border-orange-100 dark:border-orange-800' },
    { key: 'confirmed', label: 'Confirmed', icon: <FiCheckCircle />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/40', border: 'border-green-100 dark:border-green-800' },
    { key: 'completed', label: 'Completed', icon: <FiAward />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/40', border: 'border-purple-100 dark:border-purple-800' },
];

export default function DashboardPage() {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector((state) => state.doctorAppointments);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    const stats = {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
    };

    const recentAppointments = [...appointments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch {
            return {};
        }
    })();

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.name || 'Doctor'} 👋
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Here&apos;s an overview of your appointments and schedule.
                </p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map((card) => (
                    <div
                        key={card.key}
                        className={`bg-white dark:bg-gray-800 rounded-2xl border ${card.border} p-5 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                                {loading ? (
                                    <div className="h-10 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                                ) : (
                                    <p className={`text-4xl font-bold ${card.color}`}>
                                        {stats[card.key]}
                                    </p>
                                )}
                            </div>
                            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => navigate('/doctor/availability')}
                    className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <div className="text-left">
                        <h3 className="text-lg font-semibold">Manage Availability</h3>
                        <p className="text-sm text-blue-100">Set your weekly schedule</p>
                    </div>
                    <span className="text-5xl opacity-50"><FiCalendar /></span>
                </button>
                <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <div className="text-left">
                        <h3 className="text-lg font-semibold">View Appointments</h3>
                        <p className="text-sm text-purple-100">Manage patient appointments</p>
                    </div>
                    <span className="text-5xl opacity-50"><FiClipboard /></span>
                </button>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Appointments</h2>
                    <button
                        onClick={() => navigate('/doctor/appointments')}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                        View All →
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-14 bg-gray-50 dark:bg-gray-700 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : recentAppointments.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-center py-8">No appointments yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {recentAppointments.map((appt) => (
                            <div
                                key={appt._id}
                                className="flex items-center justify-between py-3 gap-3 flex-wrap"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
                                        {(appt.patientId?.userId?.name || appt.patient?.user?.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {appt.patientId?.userId?.name || appt.patient?.user?.name || 'Patient'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <FiClock /> {appt.date ? new Date(appt.date).toLocaleDateString() : '—'} • {appt.startTime || '—'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(appt.status)}`}>
                                    {appt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
