import { FiBarChart2, FiUsers, FiTag, FiClipboard } from 'react-icons/fi';
import SidebarLayout from '../shared/components/SidebarLayout';

const navItems = [
    { text: 'Dashboard', icon: <FiBarChart2 />, path: '/admin' },
    { text: 'Users', icon: <FiUsers />, path: '/admin/users' },
    { text: 'Specialties', icon: <FiTag />, path: '/admin/specialties' },
    { text: 'Appointments', icon: <FiClipboard />, path: '/admin/appointments' },
];

const AdminLayout = () => (
    <SidebarLayout
        navItems={navItems}
        portalLabel="Admin Panel"
        defaultInitial="A"
        defaultName="Admin"
    />
);

export default AdminLayout;
