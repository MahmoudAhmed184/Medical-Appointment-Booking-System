import axiosInstance from '../../../shared/api/axiosInstance';

export const getDoctorProfileApi = () => axiosInstance.get('/doctors/profile');
export const updateDoctorProfileApi = (data) => axiosInstance.put('/doctors/profile', data);
export const getAvailabilityApi = () => axiosInstance.get('/doctors/availability');
export const setAvailabilityApi = (data) => axiosInstance.post('/doctors/availability', data);
export const updateAvailabilitySlotApi = (slotId, data) => axiosInstance.put(`/doctors/availability/${slotId}`, data);
export const deleteAvailabilitySlotApi = (slotId) => axiosInstance.delete(`/doctors/availability/${slotId}`);
export const getDoctorAppointmentsApi = () => axiosInstance.get('/appointments');
export const approveAppointmentApi = (id) => axiosInstance.patch(`/appointments/${id}/approve`);
export const rejectAppointmentApi = (id) => axiosInstance.patch(`/appointments/${id}/reject`);
export const completeAppointmentApi = (id) => axiosInstance.patch(`/appointments/${id}/complete`);
export const addNotesApi = (id, notes) => axiosInstance.patch(`/appointments/${id}/notes`, { notes });
