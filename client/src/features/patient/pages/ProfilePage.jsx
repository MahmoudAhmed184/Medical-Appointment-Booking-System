import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatientProfileApi,
  updatePatientProfileApi,
} from "../services/patientApi";

export default function PatientProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    image: "https://i.pravatar.cc/120",
  });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(profile[field] ?? "");
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getPatientProfileApi();
      const patient = data?.patient || data?.data?.patient || data?.data || null;
      const user = patient?.user || patient?.userId || {};

      setProfile({
        name: user?.name || "",
        email: user?.email || "",
        phone: patient?.phone || "",
        dob: patient?.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().slice(0, 10)
          : "",
        image: "https://i.pravatar.cc/120",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const editableFields = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "dob", label: "Date of Birth" },
    ],
    []
  );

  const handleSave = async (field) => {
    const nextProfile = { ...profile, [field]: tempValue };
    setProfile(nextProfile);
    setEditingField(null);

    try {
      setSaving(true);
      setError("");
      await updatePatientProfileApi({
        name: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        dateOfBirth: nextProfile.dob,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
      // rollback by refetching backend state
      await loadProfile();
    } finally {
      setSaving(false);
    }
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
        {loading && <p className="text-sm text-slate-500">Loading profile...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saving && <p className="text-sm text-blue-600">Saving...</p>}
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <div className="relative">
            <img src={profile.image} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
            <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow border hover:text-blue-500 transition">
              <span className="material-icons text-sm">edit</span>
            </button>
          </div>

          <div className="w-full flex flex-col gap-4">

            {editableFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-slate-500 capitalize">{label}</label>
                {editingField === key ? (
                  <div className="flex gap-2 mt-1">
                    {key === "dob" ? (
                      <input type="date" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                    ) : (
                      <input value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                    )}
                    <button onClick={() => handleSave(key)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                  </div>
                ) : (
                  <p className="mt-1 text-lg cursor-pointer" onClick={() => handleEdit(key)}>
                    {profile[key] || "-"}
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