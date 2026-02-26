import { useNavigate } from 'react-router-dom';
import { HiMiniArrowLeftOnRectangle } from 'react-icons/hi2';
import { useTheme } from '../../../shared/context/ThemeContext';

const PATIENT_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/girl?username=patient';

const tabClass = (isActive) =>
  isActive
    ? 'font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer'
    : 'hover:text-[#137fec] cursor-pointer';

export default function PatientNavbar({
  activeTab = 'findDoctors',
  patientName = 'Patient',
  patientImage = PATIENT_DEFAULT_AVATAR,
}) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
            <span className="material-icons-round">icon</span>
          </div>
          <span className="font-bold text-xl">MediBook</span>
        </div>

        <div className="hidden md:flex gap-6 text-mx">
          <span onClick={() => navigate('/patient')} className={tabClass(activeTab === 'findDoctors')}>
            Find Doctors
          </span>
          <span
            onClick={() => navigate('/patient/appointments')}
            className={tabClass(activeTab === 'appointments')}
          >
            My Appointments
          </span>
          <span onClick={() => navigate('/patient/profile')} className={tabClass(activeTab === 'profile')}>
            Profile
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800 dark:text-slate-100">{patientName}</span>

          <img
            src={patientImage || PATIENT_DEFAULT_AVATAR}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />


          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#253241] text-gray-600 dark:text-yellow-400 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="group p-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 transition"
            title="Log out"
            aria-label="Log out"
          >
            <HiMiniArrowLeftOnRectangle className="text-2xl font-black group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
}