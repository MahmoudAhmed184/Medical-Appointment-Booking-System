import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BookConfirmModal from "../components/BookConfirmModal";
import { getDoctorByIdApi } from "../services/patientApi";
import {
  resetBookingState,
  setSelectedDate,
  setSelectedTime,
  setShowConfirmModal,
  setShowSlots,
} from "../../../store/slices/patientBookingSlice";

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorPage() {
  const dispatch = useDispatch();
  const { doctorId } = useParams();
  const { showSlots, selectedDate, selectedTime, showConfirmModal } = useSelector(
    (state) => state.patientBooking
  );
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await getDoctorByIdApi(doctorId);
        const rawDoctor = data?.doctor || data?.data?.doctor || data?.data || null;

        if (!rawDoctor) {
          setDoctor(null);
          setError('Doctor not found.');
          return;
        }

        setDoctor({
          id: rawDoctor?._id,
          name: rawDoctor?.userId?.name || rawDoctor?.name || 'Doctor',
          specialty: rawDoctor?.specialtyId?.name || rawDoctor?.specialty || 'Specialty',
          image: rawDoctor?.image || 'https://i.pravatar.cc/100',
          availablity: rawDoctor?.availabilityText || 'Availability not set',
          bio: rawDoctor?.bio || 'No bio available.',
          address: rawDoctor?.address || 'Address not available',
          email: rawDoctor?.userId?.email || rawDoctor?.email || '-',
          phone: rawDoctor?.phone || '-',
          timeSlots: rawDoctor?.timeSlots || [],
          availability: Array.isArray(rawDoctor?.availability) ? rawDoctor.availability : [],
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load doctor details.');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) loadDoctor();
  }, [doctorId]);

  const safeTimeSlots = useMemo(() => doctor?.timeSlots || [], [doctor]);
  const availability = useMemo(() => doctor?.availability || [], [doctor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading doctor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Doctor not found.</p>
      </div>
    );
   }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen font-display flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
              <span className="material-icons-round">icon</span>
            </div>
            <span className="font-bold text-xl">MediBook</span>
          </div>
          <div className="hidden md:flex gap-6 text-mx">
            <span 
            onClick={()=>navigate("/patient")} className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">
              Find Doctors
            </span>
            <span onClick={()=>navigate("/patient/appointments")}
            className="hover:text-[#137fec] cursor-pointer">My Appointments</span>
            <span onClick={()=>navigate("/patient/profile")} 
            className="hover:text-[#137fec] cursor-pointer">Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 dark:text-slate-100">Shaza Hamdy</span>
            <img src="https://i.pravatar.cc/40" alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">

        {/* Doctor Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <img src={doctor.image} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
          <div className="w-full flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{doctor.name}</h1>
            <p className="text-blue-500 font-medium">{doctor.specialty}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{doctor.availablity}</p>
            <p className="text-slate-700 dark:text-slate-200 mt-2">{doctor.bio}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{doctor.address}</p>
            {availability.length > 0 && (
              <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 p-3 text-left">
                <p className="text-sm font-semibold mb-2">Availability</p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-200">
                  {availability.map((slot, idx) => (
                    <p key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}>
                      {DAY_NAMES[slot.dayOfWeek] ?? slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <MdEmail className="text-blue-500" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <FaPhoneAlt className="text-blue-500" />
                <span>{doctor.phone}</span>
              </div>
            </div>

            {/* Book Button */}
            <button
              className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all"
              onClick={() => dispatch(setShowSlots(!showSlots))}
            >
              Book Appointment
            </button>

          </div>

          {/* Time Slots Card*/}
          {showSlots && (
            <div className="mt-6 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-6 flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Book with {doctor.name}
                </h2>
                <button
                  onClick={() => {
                    dispatch(setShowSlots(false));
                    dispatch(setSelectedDate(""));
                    dispatch(setSelectedTime(""));
                  }}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Date:</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                value={selectedDate}
                onChange={(e) => dispatch(setSelectedDate(e.target.value))}
              />

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Time:</label>
              <div className="flex flex-wrap gap-2">
                {safeTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => dispatch(setSelectedTime(time))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      selectedTime === time
                        ? "bg-[#137fec] text-white"
                        : "border border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {time}
                  </button>
                ))}
                {safeTimeSlots.length === 0 && (
                  <p className="text-xs text-slate-500">No available slots yet.</p>
                )}
              </div>

              <button
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedDate && selectedTime
                    ? "bg-[#137fec] text-white hover:bg-[#137fec]/90"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  dispatch(setShowConfirmModal(true));
                  dispatch(setShowSlots(false));
                }}
              >
                Confirm Appointment
              </button>
            </div>
          )}

        </div>
      </main>
      {showConfirmModal && (
        <BookConfirmModal
          doctor={doctor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDone={() => {
            dispatch(setShowConfirmModal(false));
            dispatch(resetBookingState());
          }}
        />
      )}
    </div>

    
  );
}