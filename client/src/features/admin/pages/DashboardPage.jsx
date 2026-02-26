import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FiUsers, FiClock, FiUserCheck, FiClipboard, FiTag } from 'react-icons/fi';
import { getStatusClasses } from '../../../shared/utils/statusBadge';
import {
    getUsersApi,
    getSpecialtiesApi,
    getAllAppointmentsApi,
} from '../services/adminApi';

const StatCard = ({ icon, label, value, loading, color, bg, border, onClick }) => (
    <button
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-2xl border ${border} p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full cursor-pointer`}
    >
        <div className="flex items-center justify-between">
            <div>
                {loading ? (
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${bg} ${color}`}>
                {icon}
            </div>
        </div>
    </button>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingApprovals: 0,
        totalAppointments: 0,
        totalDoctors: 0,
        totalSpecialties: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [usersRes, pendingRes, doctorsRes, appointmentsRes, specialtiesRes] =
                    await Promise.allSettled([
                        getUsersApi({ limit: 1 }),
                        getUsersApi({ limit: 1, isApproved: false, role: 'doctor' }),
                        getUsersApi({ limit: 1, role: 'doctor' }),
                        getAllAppointmentsApi({ limit: 5 }),
                        getSpecialtiesApi(),
                    ]);

                setStats({
                    totalUsers:
                        usersRes.status === 'fulfilled'
                            ? usersRes.value.data?.pagination?.totalItems || 0
                            : 0,
                    pendingApprovals:
                        pendingRes.status === 'fulfilled'
                            ? pendingRes.value.data?.pagination?.totalItems || 0
                            : 0,
                    totalDoctors:
                        doctorsRes.status === 'fulfilled'
                            ? doctorsRes.value.data?.pagination?.totalItems || 0
                            : 0,
                    totalAppointments:
                        appointmentsRes.status === 'fulfilled'
                            ? appointmentsRes.value.data?.pagination?.totalItems || 0
                            : 0,
                    totalSpecialties:
                        specialtiesRes.status === 'fulfilled'
                            ? specialtiesRes.value.data?.data?.length || 0
                            : 0,
                });

                if (appointmentsRes.status === 'fulfilled') {
                    setRecentAppointments(
                        appointmentsRes.value.data?.data?.slice(0, 5) || []
                    );
                }
            } catch {
                // stats are best-effort
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getDoctorName = (appt) => {
        if (appt.doctorId?.userId?.name) return appt.doctorId.userId.name;
        if (appt.doctorId?.name) return appt.doctorId.name;
        return 'N/A';
    };

    const getPatientName = (appt) => {
        if (appt.patientId?.userId?.name) return appt.patientId.userId.name;
        if (appt.patientId?.name) return appt.patientId.name;
        return 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Overview of your platform at a glance
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard
                    icon={<FiUsers />}
                    label="Total Users"
                    value={stats.totalUsers}
                    loading={loading}
                    color="text-blue-600"
                    bg="bg-blue-50 dark:bg-blue-900/40"
                    border="border-blue-100 dark:border-blue-800"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    icon={<FiClock />}
                    label="Pending Approvals"
                    value={stats.pendingApprovals}
                    loading={loading}
                    color="text-orange-500"
                    bg="bg-orange-50 dark:bg-orange-900/40"
                    border="border-orange-100 dark:border-orange-800"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    icon={<FiUserCheck />}
                    label="Doctors"
                    value={stats.totalDoctors}
                    loading={loading}
                    color="text-green-600"
                    bg="bg-green-50 dark:bg-green-900/40"
                    border="border-green-100 dark:border-green-800"
                    onClick={() => navigate('/admin/users')}
                />
                <StatCard
                    icon={<FiClipboard />}
                    label="Appointments"
                    value={stats.totalAppointments}
                    loading={loading}
                    color="text-purple-600"
                    bg="bg-purple-50 dark:bg-purple-900/40"
                    border="border-purple-100 dark:border-purple-800"
                    onClick={() => navigate('/admin/appointments')}
                />
                <StatCard
                    icon={<FiTag />}
                    label="Specialties"
                    value={stats.totalSpecialties}
                    loading={loading}
                    color="text-indigo-600"
                    bg="bg-indigo-50 dark:bg-indigo-900/40"
                    border="border-indigo-100 dark:border-indigo-800"
                    onClick={() => navigate('/admin/specialties')}
                />
            </div>

            {/* Quick actions + Recent appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                        >
                            <span className="text-lg"><FiUsers /></span>
                            Manage Users
                        </button>
                        <button
                            onClick={() => navigate('/admin/specialties')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                        >
                            <span className="text-lg"><FiTag /></span>
                            Manage Specialties
                        </button>
                        <button
                            onClick={() => navigate('/admin/appointments')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                        >
                            <span className="text-lg"><FiClipboard /></span>
                            View All Appointments
                        </button>
                    </div>
                </div>

                {/* Recent appointments */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Recent Appointments
                        </h2>
                        <button
                            onClick={() => navigate('/admin/appointments')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                            View all →
                        </button>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    )}

                    {!loading && !recentAppointments.length && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No appointments yet
                        </p>
                    )}

                    {!loading && recentAppointments.length > 0 && (
                        <div className="space-y-3">
                            {recentAppointments.map((appt) => (
                                <div
                                    key={appt._id}
                                    className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                            {getPatientName(appt)} → {getDoctorName(appt)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {dayjs(appt.date).format('MMM D, YYYY')} · {appt.startTime}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ml-3 flex-shrink-0 ${getStatusClasses(appt.status)}`}
                                    >
                                        {appt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
