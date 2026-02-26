import { useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import useUsers from '../hooks/useUsers';
import { useToast } from '../../../shared/hooks/useToast';
import Toast from '../../../shared/components/Toast';
import UsersTable from '../components/UsersTable';

const roleOptions = [
    { label: 'All Roles', value: '' },
    { label: 'Admin', value: 'admin' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Patient', value: 'patient' },
];

const approvalOptions = [
    { label: 'All Status', value: '' },
    { label: 'Approved', value: 'true' },
    { label: 'Pending', value: 'false' },
];

const UsersPage = () => {
    const {
        users,
        pagination,
        loading,
        error,
        actionLoading,
        filters,
        approveUser,
        blockUser,
        deleteUser,
        setFilters,
        setPage,
    } = useUsers();

    const [searchInput, setSearchInput] = useState(filters.search || '');
    const { toast, showToast } = useToast();

    const handleApprove = useCallback(
        async (id) => {
            await approveUser(id);
            showToast('User approved successfully');
        },
        [approveUser, showToast]
    );

    const handleBlock = useCallback(
        async (id) => {
            await blockUser(id);
            showToast('User status updated');
        },
        [blockUser, showToast]
    );

    const handleDelete = useCallback(
        async (id) => {
            await deleteUser(id);
            showToast('User deleted successfully');
        },
        [deleteUser, showToast]
    );

    const handleSearchSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setFilters({ search: searchInput });
        },
        [searchInput, setFilters]
    );

    const handleRoleChange = useCallback(
        (e) => setFilters({ role: e.target.value }),
        [setFilters]
    );

    const handleApprovalChange = useCallback(
        (e) => setFilters({ isApproved: e.target.value }),
        [setFilters]
    );

    const handlePageChange = useCallback(
        (page) => setPage(page),
        [setPage]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View, approve, block, or remove user accounts
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
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </form>

                    {/* Role filter */}
                    <select
                        value={filters.role}
                        onChange={handleRoleChange}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 cursor-pointer"
                    >
                        {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Approval filter */}
                    <select
                        value={filters.isApproved}
                        onChange={handleApprovalChange}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 cursor-pointer"
                    >
                        {approvalOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                <UsersTable
                    users={users}
                    pagination={pagination}
                    loading={loading}
                    actionLoading={actionLoading}
                    onApprove={handleApprove}
                    onBlock={handleBlock}
                    onDelete={handleDelete}
                    onPageChange={handlePageChange}
                />
            </div>

            <Toast toast={toast} />
        </div>
    );
};

export default UsersPage;
