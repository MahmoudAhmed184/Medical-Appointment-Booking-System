import { useEffect, useMemo, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import PatientNavbar from "../components/PatientNavbar";
import {
  getPatientProfileApi,
  updatePatientProfileApi,
} from "../services/patientApi";

const PATIENT_DEFAULT_AVATAR = "https://avatar.iran.liara.run/public/girl?username=patient";
const PHONE_REGEX = /^01\d{9}$/;

const toLocalDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getApiErrorMessage = (err) =>
  err?.response?.data?.error?.message ||
  err?.response?.data?.message ||
  "Failed to update profile";

const hasApiFieldErrors = (err) =>
  Array.isArray(err?.response?.data?.error?.details) &&
  err.response.data.error.details.length > 0;

const getApiFieldErrors = (err) => {
  const fieldMap = {
    dateOfBirth: "dob",
  };
  const details = err?.response?.data?.error?.details || [];
  if (!Array.isArray(details)) return {};

  return details.reduce((acc, item) => {
    const rawField = String(item?.field || "");
    const field = fieldMap[rawField] || rawField;
    if (!field) return acc;
    acc[field] = item?.message || "Invalid value";
    return acc;
  }, {});
};

export default function PatientProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    image: PATIENT_DEFAULT_AVATAR,
  });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(profile[field] ?? "");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setFieldErrors({});
      const { data } = await getPatientProfileApi();
      const patient = data?.patient || data?.data?.patient || data?.data || null;
      const user = patient?.user || patient?.userId || {};

      setProfile({
        name: user?.name || "",
        email: user?.email || "",
        phone: patient?.phone || "",
        dob: toLocalDateInputValue(patient?.dateOfBirth),
        address: patient?.address || "",
        image: patient?.image || PATIENT_DEFAULT_AVATAR,
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
      { key: "address", label: "Address" },
      { key: "image", label: "Image URL" },
    ],
    []
  );

  const handleSave = async (field) => {
    const nextProfile = { ...profile, [field]: tempValue };
    setFieldErrors({});

    if (field === "phone" && tempValue && !PHONE_REGEX.test(tempValue.trim())) {
      setError("");
      setFieldErrors({ phone: "Please provide a valid phone number" });
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payloadField = field === "dob" ? "dateOfBirth" : field;
      await updatePatientProfileApi({
        [payloadField]: tempValue,
      });
      setProfile(nextProfile);
      setEditingField(null);
    } catch (err) {
      if (hasApiFieldErrors(err)) {
        setError("");
      } else {
        setError(getApiErrorMessage(err));
      }
      const parsedFieldErrors = getApiFieldErrors(err);
      if (Object.keys(parsedFieldErrors).length > 0) {
        setFieldErrors(parsedFieldErrors);
      } else {
        setFieldErrors({ [field]: getApiErrorMessage(err) });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <PatientNavbar
        activeTab="profile"
        patientName={profile.name || 'Patient'}
        patientImage={profile.image || PATIENT_DEFAULT_AVATAR}
      />
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">
        {loading && <p className="text-sm text-slate-500">Loading profile...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saving && <p className="text-sm text-blue-600">Saving...</p>}

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <div className="relative">
            <img src={profile.image || PATIENT_DEFAULT_AVATAR} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
            <button onClick={() => handleEdit("image")} className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow border hover:text-blue-500 transition">
              <FiEdit2 className="text-sm" />
            </button>
          </div>

          <div className="w-full flex flex-col gap-4">

            {editableFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-slate-500 dark:text-slate-400 capitalize">{label}</label>
                {editingField === key ? (
                  <div className="mt-1">
                    <div className="flex gap-2">
                      {key === "dob" ? (
                        <input type="date" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                      ) : (
                        <input value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                      )}
                      <button onClick={() => handleSave(key)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                    </div>
                    {fieldErrors[key] && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors[key]}</p>
                    )}
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

      </main >
    </div >
  );
}