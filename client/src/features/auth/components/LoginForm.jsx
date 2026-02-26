import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const schema = yup.object({
    email: yup.string().email('Enter a valid email address').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const roleRedirects = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
};

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        if (user?.role) {
            navigate(roleRedirects[user.role] || '/');
        }
    }, [user, navigate]);

    const onSubmit = (data) => {
        dispatch(clearError());
        dispatch(loginUser(data));
    };

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

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                </label>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <FiMail className="w-5 h-5" />
                    </span>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${errors.email
                                ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-800'
                                : 'border-gray-200 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-500'
                            }`}
                    />
                </div>
                {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
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
                        className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${errors.password
                                ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-800'
                                : 'border-gray-200 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-500'
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
                )}
            </div>

            {/* Submit */}
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
                        Signing in…
                    </>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
};

export default LoginForm;
