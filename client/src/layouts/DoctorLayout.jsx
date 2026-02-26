import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../shared/context/ThemeContext';
import { FiBarChart2, FiCalendar, FiClipboard, FiUser, FiActivity, FiLogOut } from 'react-icons/fi';

const navItems = [
    { text: 'Dashboard', icon: <FiBarChart2 />, path: '/doctor' },
    { text: 'Availability', icon: <FiCalendar />, path: '/doctor/availability' },
    { text: 'Appointments', icon: <FiClipboard />, path: '/doctor/appointments' },
    { text: 'Profile', icon: <FiUser />, path: '/doctor/profile' },
];

const getUserFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
        return {};
    }
};

const DoctorLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { darkMode, toggleDarkMode } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(getUserFromStorage);

    const refreshUser = useCallback(() => {
        setUser(getUserFromStorage());
    }, []);

    useEffect(() => {
        // Listen for cross-tab storage changes
        window.addEventListener('storage', refreshUser);
        // Listen for same-tab updates (custom event)
        window.addEventListener('user-updated', refreshUser);
        return () => {
            window.removeEventListener('storage', refreshUser);
            window.removeEventListener('user-updated', refreshUser);
        };
    }, [refreshUser]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const sidebar = (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-5 py-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="flex items-center gap-3">
                    <span className="text-3xl"><FiActivity /></span>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">MediBook</h1>
                        <p className="text-xs text-blue-200">Doctor Portal</p>
                    </div>
                </div>
            </div>

            {/* Doctor info */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        {(user.name || 'D').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            Dr.{user.name || 'Doctor'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email || ''}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.text}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.text}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-200 cursor-pointer"
                >
                    <span className="text-lg"><FiLogOut /></span>
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile top bar */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30 md:hidden">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-3 text-lg font-bold text-blue-600 flex items-center gap-2">
                        <FiActivity /> MediBook
                    </span>
                </div>
                {/* Dark mode toggle — mobile */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-yellow-400 transition-colors cursor-pointer"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
            </div>

            {/* Sidebar — mobile (slide-in) */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 md:hidden
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebar}
            </aside>

            {/* Sidebar — desktop (permanent) */}
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 h-full overflow-y-auto">
                    {sidebar}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen">
                {/* Desktop top bar with dark mode toggle */}
                <div className="hidden md:flex items-center justify-end px-8 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm sticky top-0 z-20">
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                                Light Mode
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                Dark Mode
                            </>
                        )}
                    </button>
                </div>
                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DoctorLayout;
