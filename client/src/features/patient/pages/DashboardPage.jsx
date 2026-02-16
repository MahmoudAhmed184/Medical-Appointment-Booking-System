import { Email } from "@mui/icons-material";
import { use } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function DashboardPage() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      image: "https://i.pravatar.cc/100",
      availablity: "24 Feb, 10:00 AM",
      bio: "Dr. Jenkins is a board-certified cardiologist with over 15 years of experience. She specializes in treating heart conditions and improving cardiovascular health.",
      address: "123 Heart St, Cardio City",
      email:"sarah.jenkins@medibook.com",
      phone:"+1 (555) 987-6543",
      timeSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Dermatologist",
      image: "https://i.pravatar.cc/101",
      availablity: "25 Feb, 09:15 AM",
      bio: "Dr. Chen is a highly skilled dermatologist with expertise in treating skin conditions such as acne, eczema, and psoriasis. He is dedicated to helping patients achieve healthy skin.",
      address: "456 Skin Ave, Dermaville",
      email:"michael.chen@medibook.com",
      phone:"+1 (555) 123-4567",
      timeSlots: ["09:15 AM", "10:30 AM", "01:00 PM", "03:00 PM"],
    },
  ];

 const navigate =useNavigate();
 const handleDoctorClick=(doctor)=>{
  navigate(`/patient/doctor/${doctor.id}`,{state:{doctor}});
 }
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");

  const filteredDoctors = doctors.filter((doc) => {
    const matchesName = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = filterSpecialty === "All" || doc.specialty === filterSpecialty;
    return matchesName && matchesSpecialty;
  });

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
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
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
            <div
              key={doc.id}
              onClick={() => {
                handleDoctorClick(doc);
              }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex gap-4">
                <img src={doc.image} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{doc.name}</h3>
                  <p className="text-[#137fec] text-sm">{doc.specialty}</p>
                  <p className="text-sm mt-2 text-slate-500">Address: {doc.address}</p>
                  <p className="text-sm mt-1 text-slate-400">Availablity: {doc.availablity}</p>
                  <button
                    onClick={(e)=> {
                        e.stopPropagation();
                      setSelectedDoctor(doc);
                      setSelectedDate("");
                      setSelectedTime("");
                    }}
                    className="mt-3 text-[#137fec] font-semibold border px-3 py-1 rounded-lg hover:bg-[#137fec] hover:text-white transition"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
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
                  onClick={() => { setSelectedDoctor(null); setSelectedDate(""); setSelectedTime(""); }}
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
                {selectedDoctor.timeSlots.map((time) => (
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
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}