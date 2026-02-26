import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { FiClipboard } from 'react-icons/fi';
import { getStatusClasses } from '../../../shared/utils/statusBadge';
import useAppointments from '../hooks/useAppointments';
import { getDoctorName, getPatientName } from '../../../shared/utils/appointment';

const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Rejected', value: 'rejected' },
];

const getSpecialty = (appt) => {
    if (appt.doctorId?.specialtyId?.name) return appt.doctorId.specialtyId.name;
    return '';
};

const AppointmentsPage = () => {
    const {
        appointments,
        pagination,
        loading,
        error,
        filters,
        setFilters,
        setPage,
    } = useAppointments();

    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');

    const handleStatusChange = useCallback(
        (e) => setFilters({ status: e.target.value }),
        [setFilters]
    );

    const handleDateFilter = useCallback(
        (e) => {
            e.preventDefault();
            setFilters({ startDate, endDate });
        },
        [startDate, endDate, setFilters]
    );

    const handleClearDates = useCallback(() => {
        setStartDate('');
        setEndDate('');
        setFilters({ startDate: '', endDate: '' });
    }, [setFilters]);

    const handlePageChange = useCallback(
        (page) => setPage(page),
        [setPage]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Appointments</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View and monitor all appointments across the platform
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Status filter */}
                    <select
                        value={filters.status}
                        onChange={handleStatusChange}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 cursor-pointer"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Date range */}
                    <form onSubmit={handleDateFilter} className="flex flex-col sm:flex-row gap-2 flex-1">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="Start date"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="End date"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Apply
                        </button>
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={handleClearDates}
                                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Empty state */}
            {!loading && !appointments.length && (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl block mb-3"><FiClipboard className="mx-auto" /></span>
                    <p className="text-lg font-medium">No appointments found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                </div>
            )}

            {/* Desktop table */}
            {!loading && appointments.length > 0 && (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                        {/* Desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                                        <th className="pb-3 pr-4 font-medium">Date & Time</th>
                                        <th className="pb-3 pr-4 font-medium">Doctor</th>
                                        <th className="pb-3 pr-4 font-medium">Patient</th>
                                        <th className="pb-3 pr-4 font-medium">Specialty</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                                    {dayjs(appt.date).format('MMM D, YYYY')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {appt.startTime} – {appt.endTime}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                                                {getDoctorName(appt)}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                                                {getPatientName(appt)}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                                                {getSpecialty(appt) || '—'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClasses(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                                {appt.reason || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="lg:hidden space-y-3">
                            {appointments.map((appt) => (
                                <div key={appt._id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-800 dark:text-gray-100">
                                            {dayjs(appt.date).format('MMM D, YYYY')}
                                        </p>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClasses(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {appt.startTime} – {appt.endTime}
                                    </p>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <p>
                                            <span className="text-gray-500 dark:text-gray-400">Doctor:</span>{' '}
                                            <span className="text-gray-800 dark:text-gray-200">{getDoctorName(appt)}</span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500 dark:text-gray-400">Patient:</span>{' '}
                                            <span className="text-gray-800 dark:text-gray-200">{getPatientName(appt)}</span>
                                        </p>
                                        {getSpecialty(appt) && (
                                            <p>
                                                <span className="text-gray-500 dark:text-gray-400">Specialty:</span>{' '}
                                                <span className="text-gray-800 dark:text-gray-200">{getSpecialty(appt)}</span>
                                            </p>
                                        )}
                                    </div>
                                    {appt.reason && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 line-clamp-2">
                                            {appt.reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Page {pagination.page} of {pagination.totalPages}{' '}
                                ({pagination.totalItems} total)
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter((p) => {
                                        const current = pagination.page;
                                        return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                                    })
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...' ? (
                                            <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                                                    p === pagination.page
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AppointmentsPage;
