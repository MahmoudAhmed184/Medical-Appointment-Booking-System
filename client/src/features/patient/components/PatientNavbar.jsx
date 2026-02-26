import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiLogOut, FiSun, FiMoon, FiActivity } from 'react-icons/fi';
import { useTheme } from '../../../shared/context/ThemeContext';
import { PATIENT_DEFAULT_AVATAR } from '../../../shared/utils/constants';
import { logout } from '../../../store/slices/authSlice';

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
  const dispatch = useDispatch();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
            <FiActivity className="w-5 h-5" />
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
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="group p-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 transition"
            title="Log out"
            aria-label="Log out"
          >
            <FiLogOut className="text-2xl font-black group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
}