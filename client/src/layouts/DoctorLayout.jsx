import { FiBarChart2, FiCalendar, FiClipboard, FiUser } from 'react-icons/fi';
import SidebarLayout from '../shared/components/SidebarLayout';

const navItems = [
    { text: 'Dashboard', icon: <FiBarChart2 />, path: '/doctor' },
    { text: 'Availability', icon: <FiCalendar />, path: '/doctor/availability' },
    { text: 'Appointments', icon: <FiClipboard />, path: '/doctor/appointments' },
    { text: 'Profile', icon: <FiUser />, path: '/doctor/profile' },
];

const DoctorLayout = () => (
    <SidebarLayout
        navItems={navItems}
        portalLabel="Doctor Portal"
        defaultInitial="D"
        defaultName="Doctor"
        formatName={(name) => `Dr. ${name}`}
    />
);

export default DoctorLayout;
