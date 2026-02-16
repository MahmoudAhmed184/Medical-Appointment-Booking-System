import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientProfile() {
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    dob: "1988-05-12",
    gender: "Male",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi4QC2t-RpKpqzFlMoeaK2ad5yaX3RAw6bdlg_ztmKFpFzOWwLg6N0yseV9ENOvCcYNMS7zrF2OWBJ-KhLlu1fUlXtyB4M4p19T80sTlKSejetxoD1Igc5m082lHDPqB-AJYwDHuGvsWrFhLHBapP6XJ-lFD7tzYTMU9NPpGJQDLpQgp-pEVU4rIj2fAMf6yZvBDHTeLmXS0eySF-56kcoP_ZhwFh6eeo1SodZl6AL7SGB8X-rWCtDMZ9bstzQM8S8jxKZjP11Ouw",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(profile[field]);
  };

  const handleSave = (field) => {
    setProfile({ ...profile, [field]: tempValue });
    setEditingField(null);
  };

   const navigate =useNavigate();
  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen font-display flex flex-col">
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
       className="hover:text-[#137fec] cursor-pointer">Find Doctors</span>
      <span onClick={()=>navigate("/patient/appointments")}
       className="hover:text-[#137fec] cursor-pointer">My Appointments</span>
      <span onClick={()=>navigate("/patient/profile")}
       className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">
        Profile
      </span>
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
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <div className="relative">
            <img src={profile.image} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
            <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow border hover:text-blue-500 transition">
              <span className="material-icons text-sm">edit</span>
            </button>
          </div>

          <div className="w-full flex flex-col gap-4">

            {["firstName", "lastName", "dob", "gender", "email", "phone"].map((field) => (
              <div key={field}>
                <label className="text-sm text-slate-500 capitalize">{field === "dob" ? "Date of Birth" : field}</label>
                {editingField === field ? (
                  <div className="flex gap-2 mt-1">
                    {field === "gender" ? (
                      <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    ) : field === "dob" ? (
                      <input type="date" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                    ) : (
                      <input value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                    )}
                    <button onClick={() => handleSave(field)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                  </div>
                ) : (
                  <p className="mt-1 text-lg cursor-pointer" onClick={() => handleEdit(field)}>
                    {profile[field]}
                  </p>
                )}
              </div>
            ))}

          </div>
        </div>

      </main>
    </div>
  );
}