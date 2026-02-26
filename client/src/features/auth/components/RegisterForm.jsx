import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';
import { registerUser, clearError } from '../../../store/slices/authSlice';
import { getSpecialtiesApi } from '../services/authApi';

/* ───── Validation schema ───── */
const schema = yup.object({
    name: yup
        .string()
        .required('Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    email: yup
        .string()
        .required('Email is required')
        .email('Enter a valid email address'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords do not match'),
    role: yup
        .string()
        .required('Please select a role')
        .oneOf(['patient', 'doctor'], 'Invalid role'),

    /* ── Patient-specific ── */
    phone: yup.string().when('role', {
        is: (val) => val === 'patient' || val === 'doctor',
        then: (s) => s.required('Phone number is required'),
    }),
    dateOfBirth: yup.string().when('role', {
        is: 'patient',
        then: (s) =>
            s.required('Date of birth is required')
                .test('past', 'Date of birth must be in the past', (v) => v && new Date(v) < new Date()),
    }),

    /* ── Doctor-specific ── */
    specialtyId: yup.string().when('role', {
        is: 'doctor',
        then: (s) => s.required('Specialty is required'),
    }),
    bio: yup.string().max(500, 'Bio cannot exceed 500 characters'),
    address: yup.string().max(300, 'Address cannot exceed 300 characters'),
});

const roleRedirects = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
};

const RegisterForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [specialtiesLoading, setSpecialtiesLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { role: 'patient' },
    });

    const selectedRole = watch('role');

    /* Redirect after successful registration */
    useEffect(() => {
        if (user?.role) {
            navigate(roleRedirects[user.role] || '/');
        }
    }, [user, navigate]);

    /* Fetch specialties when doctor is selected */
    useEffect(() => {
        if (selectedRole === 'doctor' && specialties.length === 0) {
            setSpecialtiesLoading(true);
            getSpecialtiesApi()
                .then(({ data }) => {
                    const list = data.data || data;
                    setSpecialties(Array.isArray(list) ? list : []);
                })
                .catch(() => setSpecialties([]))
                .finally(() => setSpecialtiesLoading(false));
        }
    }, [selectedRole]);

    const onSubmit = (data) => {
        dispatch(clearError());
        const { confirmPassword, ...payload } = data;

        /* Remove fields not relevant to the selected role */
        if (payload.role === 'patient') {
            delete payload.specialtyId;
            delete payload.bio;
        }
        if (payload.role === 'doctor') {
            delete payload.dateOfBirth;
        }
        /* Remove empty optional fields */
        if (!payload.bio) delete payload.bio;
        if (!payload.address) delete payload.address;

        dispatch(registerUser(payload));
    };

    /* ───── Shared input classes ───── */
    const inputClass = (err) =>
        `w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${err
            ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-800'
            : 'border-gray-200 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-500'
        }`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* API Error */}
            {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <div>
                        {error.includes('\n') ? (
                            <ul className="list-disc list-inside space-y-0.5">
                                {error.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                        ) : (
                            <span>{error}</span>
                        )}
                    </div>
                </div>
            )}

            {/* ───── Role Toggle ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'patient', label: 'Patient', desc: 'Book appointments', emoji: '🏥' },
                        { value: 'doctor', label: 'Doctor', desc: 'Manage schedule', emoji: '🩺' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setValue('role', option.value, { shouldValidate: true })}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                                ${selectedRole === option.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700/50'
                                }`}
                        >
                            <span className="text-2xl">{option.emoji}</span>
                            <p className={`mt-1 text-sm font-semibold ${selectedRole === option.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                {option.label}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{option.desc}</p>
                            {selectedRole === option.value && (
                                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {errors.role && (
                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.role.message}</p>
                )}
            </div>

            {/* ───── Full Name ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiUser className="w-5 h-5" />
                    </span>
                    <input type="text" placeholder="John Doe" {...register('name')} className={inputClass(errors.name)} />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>

            {/* ───── Email ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiMail className="w-5 h-5" />
                    </span>
                    <input type="email" placeholder="you@example.com" {...register('email')} className={inputClass(errors.email)} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
            </div>

            {/* ───── Phone ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiPhone className="w-5 h-5" />
                    </span>
                    <input type="tel" placeholder="+20 123 456 7890" {...register('phone')} className={inputClass(errors.phone)} />
                </div>
                {errors.phone && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.phone.message}</p>}
            </div>

            {/* ───── Patient: Date of Birth ───── */}
            {selectedRole === 'patient' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Date of Birth
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            <FiCalendar className="w-5 h-5" />
                        </span>
                        <input type="date" {...register('dateOfBirth')} className={inputClass(errors.dateOfBirth)} />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.dateOfBirth.message}</p>}
                </div>
            )}

            {/* ───── Doctor: Specialty ───── */}
            {selectedRole === 'doctor' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Specialty
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                            </svg>
                        </span>
                        <select
                            {...register('specialtyId')}
                            disabled={specialtiesLoading}
                            className={`${inputClass(errors.specialtyId)} appearance-none cursor-pointer`}
                        >
                            <option value="">
                                {specialtiesLoading ? 'Loading specialties…' : 'Select a specialty'}
                            </option>
                            {specialties.map((s) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                    {errors.specialtyId && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.specialtyId.message}</p>}
                </div>
            )}

            {/* ───── Doctor: Bio (optional) ───── */}
            {selectedRole === 'doctor' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Bio <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        placeholder="Tell patients about yourself…"
                        rows={3}
                        {...register('bio')}
                        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${errors.bio
                                ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-800'
                                : 'border-gray-200 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-500'
                            }`}
                    />
                    {errors.bio && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.bio.message}</p>}
                </div>
            )}

            {/* ───── Address (optional, both roles) ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiMapPin className="w-5 h-5" />
                    </span>
                    <input type="text" placeholder="Your address" {...register('address')} className={inputClass(errors.address)} />
                </div>
                {errors.address && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.address.message}</p>}
            </div>

            {/* ───── Password ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiLock className="w-5 h-5" />
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        className={`${inputClass(errors.password)} !pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Minimum 6 characters
                </p>
            </div>

            {/* ───── Confirm Password ───── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiLock className="w-5 h-5" />
                    </span>
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                        className={`${inputClass(errors.confirmPassword)} !pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    >
                        {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            {/* Doctor notice */}
            {selectedRole === 'doctor' && (
                <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl text-sm">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Doctor accounts require admin approval before you can log in.</span>
                </div>
            )}

            {/* ───── Submit ───── */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account…
                    </>
                ) : (
                    'Create Account'
                )}
            </button>
        </form>
    );
};

export default RegisterForm;
