import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
    name: yup
        .string()
        .required('Specialty name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: yup
        .string()
        .max(500, 'Description must be at most 500 characters')
        .nullable()
        .transform((val) => (val === '' ? null : val)),
});

const SpecialtyForm = ({ initialData = null, onSubmit, loading = false, onCancel }) => {
    const isEdit = Boolean(initialData);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name || '',
                description: initialData.description || '',
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            if (!isEdit) reset({ name: '', description: '' });
        } catch {
            // error handled by parent
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="specialty-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specialty Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="specialty-name"
                    type="text"
                    placeholder="e.g. Cardiology"
                    {...register('name')}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        errors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                />
                {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="specialty-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                </label>
                <textarea
                    id="specialty-desc"
                    rows={3}
                    placeholder="Brief description of this specialty..."
                    {...register('description')}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        errors.description ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                />
                {errors.description && (
                    <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {loading
                        ? isEdit
                            ? 'Updating...'
                            : 'Creating...'
                        : isEdit
                        ? 'Update Specialty'
                        : 'Create Specialty'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default SpecialtyForm;
