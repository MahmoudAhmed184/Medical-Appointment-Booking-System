import { useState, useCallback } from 'react';
import useUsers from '../hooks/useUsers';
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
                <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                <p className="text-sm text-gray-500 mt-1">
                    View, approve, block, or remove user accounts
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </form>

                    {/* Role filter */}
                    <select
                        value={filters.role}
                        onChange={handleRoleChange}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white cursor-pointer"
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
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white cursor-pointer"
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
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <UsersTable
                    users={users}
                    pagination={pagination}
                    loading={loading}
                    actionLoading={actionLoading}
                    onApprove={approveUser}
                    onBlock={blockUser}
                    onDelete={deleteUser}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default UsersPage;
