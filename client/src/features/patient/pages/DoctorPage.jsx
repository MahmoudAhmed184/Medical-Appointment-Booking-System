import { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BookConfirmModal from "../components/BookConfirmModal";

export default function DoctorPage() {


  const [showSlots, setShowSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmModal,setShowConfirmModal] = useState(false)

   const location = useLocation();
   const doctor = location.state?.doctor;
   const navigate =useNavigate();
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
              onClick={() => setShowSlots(!showSlots)}
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
                    setShowSlots(false);
                    setSelectedDate("");
                    setSelectedTime("");
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
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Time:</label>
              <div className="flex flex-wrap gap-2">
                {doctor.timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
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
                onClick={() => {
                  setShowConfirmModal(true);
                  setShowSlots(false);
                }}
              >
                Confirm Appointment
              </button>
            </div>
          )}

        </div>
      </main>
      {showConfirmModal && (<BookConfirmModal doctor={doctor} setSelectedDate={setSelectedDate} setSelectedTime={setSelectedTime} setShowConfirmModal={setShowConfirmModal} selectedDate={selectedDate} selectedTime={selectedTime} />)}
    </div>

    
  );
}