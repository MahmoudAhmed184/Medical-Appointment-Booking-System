import { useState, useCallback } from 'react';
import useSpecialties from '../hooks/useSpecialties';
import SpecialtyForm from '../components/SpecialtyForm';

const SpecialtiesPage = () => {
    const {
        specialties,
        loading,
        error,
        formLoading,
        formError,
        createSpecialty,
        updateSpecialty,
        deleteSpecialty,
        clearError,
    } = useSpecialties();

    const [showForm, setShowForm] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleCreate = useCallback(
        async (data) => {
            await createSpecialty(data);
            setShowForm(false);
        },
        [createSpecialty]
    );

    const handleUpdate = useCallback(
        async (data) => {
            await updateSpecialty(editingSpecialty._id, data);
            setEditingSpecialty(null);
        },
        [updateSpecialty, editingSpecialty]
    );

    const handleDelete = useCallback(
        async (id) => {
            await deleteSpecialty(id);
            setConfirmDelete(null);
        },
        [deleteSpecialty]
    );

    const handleEdit = useCallback((specialty) => {
        setEditingSpecialty(specialty);
        setShowForm(false);
        clearError();
    }, [clearError]);

    const handleOpenCreate = useCallback(() => {
        setShowForm(true);
        setEditingSpecialty(null);
        clearError();
    }, [clearError]);

    const handleCancelForm = useCallback(() => {
        setShowForm(false);
        setEditingSpecialty(null);
        clearError();
    }, [clearError]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Specialties</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Create, edit, and remove medical specialties
                    </p>
                </div>
                {!showForm && !editingSpecialty && (
                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        + Add Specialty
                    </button>
                )}
            </div>

            {/* Error banner */}
            {(error || formError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error || formError}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        New Specialty
                    </h2>
                    <SpecialtyForm
                        onSubmit={handleCreate}
                        loading={formLoading}
                        onCancel={handleCancelForm}
                    />
                </div>
            )}

            {/* Edit form */}
            {editingSpecialty && (
                <div className="bg-white rounded-xl border border-blue-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Edit Specialty
                    </h2>
                    <SpecialtyForm
                        initialData={editingSpecialty}
                        onSubmit={handleUpdate}
                        loading={formLoading}
                        onCancel={handleCancelForm}
                    />
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Empty state */}
            {!loading && !specialties.length && (
                <div className="text-center py-16 text-gray-500">
                    <span className="text-4xl block mb-3">🏷️</span>
                    <p className="text-lg font-medium">No specialties yet</p>
                    <p className="text-sm">Create your first medical specialty above</p>
                </div>
            )}

            {/* Specialties list */}
            {!loading && specialties.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {specialties.map((specialty) => (
                        <div
                            key={specialty._id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-semibold text-gray-800">
                                    {specialty.name}
                                </h3>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleEdit(specialty)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    {confirmDelete === specialty._id ? (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleDelete(specialty._id)}
                                                disabled={formLoading}
                                                className="px-2 py-1 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(specialty._id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {specialty.description || 'No description provided'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpecialtiesPage;
