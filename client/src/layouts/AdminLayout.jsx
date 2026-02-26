import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../shared/context/ThemeContext';
import { FiBarChart2, FiUsers, FiTag, FiClipboard, FiActivity, FiLogOut, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { getUserFromStorage } from '../shared/utils/storage';

const navItems = [
    { text: 'Dashboard', icon: <FiBarChart2 />, path: '/admin' },
    { text: 'Users', icon: <FiUsers />, path: '/admin/users' },
    { text: 'Specialties', icon: <FiTag />, path: '/admin/specialties' },
    { text: 'Appointments', icon: <FiClipboard />, path: '/admin/appointments' },
];

const AdminLayout = () => {
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
        window.addEventListener('storage', refreshUser);
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
                        <p className="text-xs text-blue-200">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Admin info */}
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        {(user.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {user.name || 'Admin'}
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-200 cursor-pointer"
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
                        <FiMenu className="w-6 h-6" />
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
                    {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
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
                                <FiSun className="w-4 h-4" />
                                Light Mode
                            </>
                        ) : (
                            <>
                                <FiMoon className="w-4 h-4" />
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

export default AdminLayout;
