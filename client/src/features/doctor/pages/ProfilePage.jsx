import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorProfileApi, updateDoctorProfileApi } from '../services/doctorApi';

const DOCTOR_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/boy?username=doctor';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    image: DOCTOR_DEFAULT_AVATAR,
  });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getDoctorProfileApi();
      const doctor = data?.doctor || data?.data?.doctor || data?.data || null;
      const user = doctor?.userId || {};

      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: doctor?.phone || '',
        bio: doctor?.bio || '',
        address: doctor?.address || '',
        image: doctor?.image || DOCTOR_DEFAULT_AVATAR,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const editableFields = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'bio', label: 'Bio' },
      { key: 'image', label: 'Image URL' },
    ],
    []
  );

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(profile[field] ?? '');
  };

  const handleSave = async (field) => {
    const nextProfile = { ...profile, [field]: tempValue };
    setProfile(nextProfile);
    setEditingField(null);

    try {
      setSaving(true);
      setError('');
      await updateDoctorProfileApi({
        name: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        bio: nextProfile.bio,
        address: nextProfile.address,
        image: nextProfile.image,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update doctor profile');
      await loadProfile();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
              <span className="material-icons-round">icon</span>
            </div>
            <span className="font-bold text-xl">MediBook</span>
          </div>

          <div className="hidden md:flex gap-6 text-mx">
            <span onClick={() => navigate('/doctor')} className="hover:text-[#137fec] cursor-pointer">Dashboard</span>
            <span onClick={() => navigate('/doctor/appointments')} className="hover:text-[#137fec] cursor-pointer">Appointments</span>
            <span onClick={() => navigate('/doctor/availability')} className="hover:text-[#137fec] cursor-pointer">Availability</span>
            <span onClick={() => navigate('/doctor/profile')} className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">Profile</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">
        {loading && <p className="text-sm text-slate-500">Loading profile...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saving && <p className="text-sm text-blue-600">Saving...</p>}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src={profile.image || DOCTOR_DEFAULT_AVATAR}
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
            />
            <button
              onClick={() => handleEdit('image')}
              className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow border hover:text-blue-500 transition"
            >
              <span className="material-icons text-sm">edit</span>
            </button>
          </div>

          <div className="w-full flex flex-col gap-4">
            {editableFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-slate-500 capitalize">{label}</label>
                {editingField === key ? (
                  <div className="flex gap-2 mt-1">
                    {key === 'bio' ? (
                      <textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                        rows={3}
                      />
                    ) : (
                      <input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                      />
                    )}
                    <button onClick={() => handleSave(key)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                  </div>
                ) : (
                  <p className="mt-1 text-lg cursor-pointer" onClick={() => handleEdit(key)}>
                    {profile[key] || '-'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
