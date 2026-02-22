import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BookConfirmModal from "../components/BookConfirmModal";
import DoctorCard from "../components/DoctorCard";
import {
  clearSelectedDoctor,
  setFilterSpecialty,
  setSearch,
  setSelectedDoctorById,
} from "../../../store/slices/patientDoctorsSlice";
import {
  resetBookingState,
  setSelectedDate,
  setSelectedTime,
  setShowConfirmModal,
} from "../../../store/slices/patientBookingSlice";


export default function DashboardPage() {
  const dispatch = useDispatch();
  const { doctors, search, filterSpecialty, selectedDoctorId } = useSelector(
    (state) => state.patientDoctors
  );
  const { selectedDate, selectedTime, showConfirmModal } = useSelector(
    (state) => state.patientBooking
  );

 const navigate =useNavigate();
 const handleDoctorClick=(doctor)=>{
  navigate(`/patient/doctor/${doctor.id}`,{state:{doctor}});
 }
  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  );

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doc) => {
        const matchesName = doc.name.toLowerCase().includes(search.toLowerCase());
        const matchesSpecialty =
          filterSpecialty === "All" || doc.specialty === filterSpecialty;
        return matchesName && matchesSpecialty;
      }),
    [doctors, search, filterSpecialty]
  );

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

    {/* TABS - Center */}
    <div className="hidden md:flex gap-6 text-mx">
      <span onClick={()=>navigate("/patient")} 
      className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">
        Find Doctors
      </span>
      <span onClick={()=>navigate("/patient/appointments")}
       className="hover:text-[#137fec] cursor-pointer">My Appointments</span>
      <span onClick={()=>navigate("/patient/profile")}
      className="hover:text-[#137fec] cursor-pointer">Profile</span>
    </div>

    {/* PROFILE - Right */}
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
      <main className="max-w-7xl mx-auto px-4 py-8 w-full grid lg:grid-cols-12 gap-8 transition-all duration-300">

        {/* Doctor List */}
        <div
          className={`space-y-6 transition-all duration-300 ${
            selectedDoctor ? "lg:col-span-8" : "lg:col-span-12"
          }`}
        >
          {/* Search / Filter */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl shadow bg-white mb-4">
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <select
              value={filterSpecialty}
              onChange={(e) => dispatch(setFilterSpecialty(e.target.value))}
              className="border rounded-lg px-3 py-2"
            >
              <option>All</option>
              <option>Cardiologist</option>
              <option>Dermatologist</option>
            </select>
            <button
              onClick={() => {}}
              className="px-5 py-2 rounded-lg text-white bg-[#137fec]"
            >
              Search
            </button>
          </div>

          {/* Doctor Cards */}
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onOpenDoctor={handleDoctorClick}
              onBook={(doctor) => {
                dispatch(setSelectedDoctorById(doctor.id));
                dispatch(setSelectedDate(""));
                dispatch(setSelectedTime(""));
              }}
            />
          ))}
        </div>

        {/* Booking Card */}
        {selectedDoctor && (
          <div className="lg:col-span-4 relative transition-all duration-300">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-xl shadow-lg border p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Book with {selectedDoctor.name}
                </h2>
                <button
                  onClick={() => {
                    dispatch(clearSelectedDoctor());
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
                {selectedDoctor.timeSlots.map((time) => (
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
              </div>

              <button
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedDate && selectedTime
                    ? "bg-[#137fec] text-white hover:bg-[#137fec]/90"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                onClick={() => dispatch(setShowConfirmModal(true))}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}

      </main>
            {showConfirmModal && selectedDoctor && (
              <BookConfirmModal
                doctor={selectedDoctor}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDone={() => {
                  dispatch(setShowConfirmModal(false));
                  dispatch(resetBookingState());
                  dispatch(clearSelectedDoctor());
                }}
              />
            )}

      

    </div>
  );
}