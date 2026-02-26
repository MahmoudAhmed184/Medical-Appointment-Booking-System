import { useState, useCallback } from 'react';
import { FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import useSpecialties from '../hooks/useSpecialties';
import useToast from '../../../shared/hooks/useToast';
import Toast from '../../../shared/components/Toast';
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
    const { toast, showToast } = useToast();

    const handleCreate = useCallback(
        async (data) => {
            await createSpecialty(data);
            setShowForm(false);
            showToast('Specialty created successfully');
        },
        [createSpecialty, showToast]
    );

    const handleUpdate = useCallback(
        async (data) => {
            await updateSpecialty(editingSpecialty._id, data);
            setEditingSpecialty(null);
            showToast('Specialty updated successfully');
        },
        [updateSpecialty, editingSpecialty, showToast]
    );

    const handleDelete = useCallback(
        async (id) => {
            await deleteSpecialty(id);
            setConfirmDelete(null);
            showToast('Specialty deleted successfully');
        },
        [deleteSpecialty, showToast]
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Specialties</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error || formError}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
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
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl block mb-3"><FiTag className="mx-auto" /></span>
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
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                    {specialty.name}
                                </h3>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleEdit(specialty)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
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
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {specialty.description || 'No description provided'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <Toast toast={toast} />
        </div>
    );
};

export default SpecialtiesPage;
