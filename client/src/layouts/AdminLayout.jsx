import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { text: 'Dashboard', icon: '📊', path: '/admin' },
    { text: 'Users', icon: '👥', path: '/admin/users' },
    { text: 'Specialties', icon: '🏷️', path: '/admin/specialties' },
    { text: 'Appointments', icon: '📋', path: '/admin/appointments' },
];

const getUserFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
        return {};
    }
};

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const sidebar = (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-5 py-5 bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏥</span>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">MediBook</h1>
                        <p className="text-xs text-purple-200">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Admin info */}
            <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                        {(user.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {user.name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
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
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.text}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-3 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
                >
                    <span className="text-lg">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile top bar */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-30 md:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="ml-3 text-lg font-bold text-purple-600">🏥 MediBook</span>
            </div>

            {/* Sidebar — mobile (slide-in) */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:hidden
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebar}
            </aside>

            {/* Sidebar — desktop (permanent) */}
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full overflow-y-auto">
                    {sidebar}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
