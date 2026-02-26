import { useState } from 'react';
import dayjs from 'dayjs';

const roleBadge = {
    admin: 'bg-blue-100 text-blue-700',
    doctor: 'bg-blue-100 text-blue-700',
    patient: 'bg-green-100 text-green-700',
};

const UsersTable = ({
    users = [],
    pagination = {},
    loading,
    actionLoading,
    onApprove,
    onBlock,
    onDelete,
    onPageChange,
}) => {
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (id) => {
        onDelete(id);
        setConfirmDelete(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="text-center py-16 text-gray-500">
                <span className="text-4xl block mb-3">👥</span>
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500 uppercase text-xs tracking-wider">
                            <th className="pb-3 pr-4 font-medium">Name</th>
                            <th className="pb-3 pr-4 font-medium">Email</th>
                            <th className="pb-3 pr-4 font-medium">Role</th>
                            <th className="pb-3 pr-4 font-medium">Status</th>
                            <th className="pb-3 pr-4 font-medium">Joined</th>
                            <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                            {(user.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{user.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                                <td className="py-3 pr-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadge[user.role] || 'bg-gray-100 text-gray-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 pr-4">
                                    <div className="flex gap-1.5">
                                        {user.isBlocked && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                Blocked
                                            </span>
                                        )}
                                        {!user.isApproved && !user.isBlocked && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Pending
                                            </span>
                                        )}
                                        {user.isApproved && !user.isBlocked && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-gray-500">
                                    {dayjs(user.createdAt).format('MMM D, YYYY')}
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!user.isApproved && user.role === 'doctor' && (
                                            <button
                                                onClick={() => onApprove(user._id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onBlock(user._id)}
                                            disabled={actionLoading}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                                                user.isBlocked
                                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                            }`}
                                        >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                        {confirmDelete === user._id ? (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDelete(user._id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {users.map((user) => (
                    <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                    {(user.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadge[user.role] || 'bg-gray-100 text-gray-700'}`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            {user.isBlocked && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Blocked</span>
                            )}
                            {!user.isApproved && !user.isBlocked && (
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
                            )}
                            {user.isApproved && !user.isBlocked && (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                            )}
                            <span className="text-gray-400 ml-auto">
                                {dayjs(user.createdAt).format('MMM D, YYYY')}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                            {!user.isApproved && user.role === 'doctor' && (
                                <button
                                    onClick={() => onApprove(user._id)}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Approve
                                </button>
                            )}
                            <button
                                onClick={() => onBlock(user._id)}
                                disabled={actionLoading}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                                    user.isBlocked
                                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                            >
                                {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            {confirmDelete === user._id ? (
                                <>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        disabled={actionLoading}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setConfirmDelete(user._id)}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
                    <p className="text-sm text-gray-500">
                        Showing page {pagination.page} of {pagination.totalPages}{' '}
                        ({pagination.totalItems} total)
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter((p) => {
                                const current = pagination.page;
                                return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                            })
                            .reduce((acc, p, i, arr) => {
                                if (i > 0 && p - arr[i - 1] > 1) {
                                    acc.push('...');
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => onPageChange(p)}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                                            p === pagination.page
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
