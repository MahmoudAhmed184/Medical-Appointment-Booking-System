import { useNavigate } from 'react-router-dom';
import useAppointments from '../hooks/useAppointments';

const STAT_CARDS = [
    { key: 'total', label: 'Total Appointments', icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { key: 'pending', label: 'Pending', icon: '⏳', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { key: 'completed', label: 'Completed', icon: '🏆', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-600',
    rejected: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
    const { appointments, loading, error } = useAppointments();
    const navigate = useNavigate();

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
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user.name || 'Doctor'} 👋
                </h1>
                <p className="mt-1 text-gray-500">
                    Here&apos;s an overview of your appointments and schedule.
                </p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map((card) => (
                    <div
                        key={card.key}
                        className={`bg-white rounded-2xl border ${card.border} p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                                {loading ? (
                                    <div className="h-10 w-12 bg-gray-100 rounded-lg animate-pulse" />
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
                    <span className="text-5xl opacity-50">📅</span>
                </button>
                <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <div className="text-left">
                        <h3 className="text-lg font-semibold">View Appointments</h3>
                        <p className="text-sm text-purple-100">Manage patient appointments</p>
                    </div>
                    <span className="text-5xl opacity-50">📋</span>
                </button>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
                    <button
                        onClick={() => navigate('/doctor/appointments')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                        View All →
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : recentAppointments.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No appointments yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recentAppointments.map((appt) => (
                            <div
                                key={appt._id}
                                className="flex items-center justify-between py-3 gap-3 flex-wrap"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                                        {(appt.patientId?.userId?.name || appt.patient?.user?.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {appt.patientId?.userId?.name || appt.patient?.user?.name || 'Patient'}
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            🕐 {appt.date ? new Date(appt.date).toLocaleDateString() : '—'} • {appt.startTime || '—'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[appt.status] || 'bg-gray-100 text-gray-600'}`}>
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
