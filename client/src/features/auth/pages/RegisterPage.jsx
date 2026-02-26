import { Link } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';
import RegisterForm from '../components/RegisterForm';
import { useTheme } from '../../../shared/context/ThemeContext';

const RegisterPage = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* ─── Left Brand Panel ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <FiActivity className="w-7 h-7" />
                        </div>
                        <span className="text-2xl font-bold">Alfihaa Docs</span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                        Join Alfihaa Docs<br />Today
                    </h1>
                    <p className="text-lg text-blue-100 leading-relaxed max-w-md mb-10">
                        Whether you&apos;re a patient seeking care or a doctor ready to help — create your account and get started in minutes.
                    </p>
                </div>
            </div>

            {/* ─── Right Form Panel ─── */}
            <div className="flex-1 flex flex-col">
                {/* Top bar — dark mode toggle */}
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <FiActivity className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Alfihaa Docs</span>
                    </div>
                    <div className="lg:flex-1" />
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors cursor-pointer"
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Form card */}
                <div className="flex-1 flex items-center justify-center px-6 pb-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Fill in your details to get started
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
                            <RegisterForm />
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
