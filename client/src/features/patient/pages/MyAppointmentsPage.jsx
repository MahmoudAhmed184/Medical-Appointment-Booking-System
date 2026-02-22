import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  cancelAppointment,
  fetchMyAppointments,
  rescheduleAppointment,
} from '../../../store/slices/appointmentSlice';
import { useEffect } from 'react';
import AppointmentList from '../components/AppointmentList';

export default function MyAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

   const navigate =useNavigate();

  const mappedAppointments = appointments.map((item) => ({
    id: item._id,
    doctorName: item?.doctorId?.userId?.name || 'Doctor',
    specialty: item?.doctorId?.specialtyId?.name || 'Specialty',
    date: `${new Date(item.date).toLocaleDateString()} ${item.startTime} - ${item.endTime}`,
    status: String(item.status || '').replace(/^./, (c) => c.toUpperCase()),
    image: 'https://i.pravatar.cc/100',
  }));

  const handleCancel = async (id) => {
    await dispatch(cancelAppointment(id));
    dispatch(fetchMyAppointments());
  };

  const handleReschedule = async (id) => {
    const date = window.prompt('Enter new date (YYYY-MM-DD):');
    if (!date) return;
    const startTime = window.prompt('Enter new start time (HH:mm):');
    if (!startTime) return;
    const endTime = window.prompt('Enter new end time (HH:mm):');
    if (!endTime) return;

    await dispatch(rescheduleAppointment({ id, payload: { date, startTime, endTime } }));
    dispatch(fetchMyAppointments());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-100">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
        <span className="material-icons-round">icon</span>
      </div>
      <span className="font-bold text-xl">MediBook</span>
          </div>

          {/* TABS */}
          <div className="hidden md:flex gap-6 text-mx">
            <span onClick={()=>navigate("/patient")}
             className="hover:text-[#137fec] cursor-pointer">Find Doctors</span>
            <span onClick={()=>navigate("/patient/appointments")}
             className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">My Appointments</span>
            <span onClick={()=>navigate("/patient/profile")} className="hover:text-[#137fec] cursor-pointer">Profile</span>
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 dark:text-slate-100">Shaza Hamdy</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            
          </div>

        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold mb-2">My Appointments</h1>
        <p className="text-slate-500 mb-6">Here are all your booked appointments.</p>

        {loading && <p className="mb-4">Loading appointments...</p>}

        {/* Appointments List */}
        <AppointmentList
          appointments={mappedAppointments}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
        />
      </main>
    </div>
  );
}