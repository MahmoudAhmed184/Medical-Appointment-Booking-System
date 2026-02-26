import { useState, useEffect } from 'react';
import { getDoctorProfileApi, updateDoctorProfileApi } from '../services/doctorApi';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getDoctorProfileApi();
            setProfile(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEdit = () => {
        setFormData({
            name: profile?.userId?.name || '',
            email: profile?.userId?.email || '',
            phone: profile?.phone || '',
            bio: profile?.bio || '',
            address: profile?.address || '',
            image: profile?.image || '',
        });
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({});
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await updateDoctorProfileApi(formData);
            setProfile(data.data);
            setEditing(false);
            try {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                if (formData.name) user.name = formData.name;
                if (formData.email) user.email = formData.email;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('user-updated'));
            } catch { /* ignore */ }
            showToast('Profile updated successfully');
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
            <p className="text-gray-500 mb-8">View and manage your doctor profile information.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                        <img
                            src={editing ? formData.image : profile?.image}
                            alt="Avatar"
                            className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-blue-100 object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${profile?.userId?.name || 'D'}&background=dbeafe&color=2563eb&size=112&font-size=0.4&bold=true`;
                            }}
                        />
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Dr. {profile?.userId?.name || 'Doctor'}
                        </h2>
                        {profile?.specialtyId && (
                            <span className="inline-block px-3 py-1 border border-blue-300 text-blue-600 text-sm font-semibold rounded-full mb-4">
                                {profile.specialtyId.name}
                            </span>
                        )}

                        <hr className="my-4 border-gray-100" />

                        <div className="text-left space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>📧</span> {profile?.userId?.email || '—'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>📱</span> {profile?.phone || '—'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>📍</span> {profile?.address || '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Details / Edit */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editing ? 'Edit Profile' : 'Profile Details'}
                            </h3>
                            {!editing && (
                                <button
                                    onClick={handleEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange('name')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange('email')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={handleChange('phone')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange('address')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={handleChange('image')}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Enter a URL for your profile image</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={handleChange('bio')}
                                        rows={4}
                                        placeholder="Tell patients about yourself, your experience, and specializations..."
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
                                        <p className="text-sm text-gray-800">Dr. {profile?.userId?.name || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-sm text-gray-800">{profile?.userId?.email || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                                        <p className="text-sm text-gray-800">{profile?.phone || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Specialty</p>
                                        <p className="text-sm text-gray-800">{profile?.specialtyId?.name || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Address</p>
                                        <p className="text-sm text-gray-800">{profile?.address || '—'}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                                    <p className="text-sm text-gray-800">{profile?.bio || 'No bio added yet.'}</p>
                                </div>

                                {/* Availability Summary */}
                                {profile?.availability?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Availability Schedule</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.availability.map((slot, i) => {
                                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                return (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600"
                                                    >
                                                        {days[slot.dayOfWeek]} {slot.startTime}–{slot.endTime}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}
