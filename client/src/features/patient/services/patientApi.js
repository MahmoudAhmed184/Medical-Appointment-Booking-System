import axiosInstance from '../../../shared/api/axiosInstance';

export const getDoctorsApi = (params) => axiosInstance.get('/doctors', { params });
export const getDoctorByIdApi = (id) => axiosInstance.get(`/doctors/${id}`);
export const getAvailableSlotsApi = (doctorId, date) => axiosInstance.get(`/doctors/${doctorId}/available-slots`, { params: { date } });
export const bookAppointmentApi = (data) => axiosInstance.post('/appointments', data);
export const getMyAppointmentsApi = (params) => axiosInstance.get('/appointments', { params });
export const cancelAppointmentApi = (id) => axiosInstance.patch(`/appointments/${id}/cancel`);
export const rescheduleAppointmentApi = (id, data) => axiosInstance.patch(`/appointments/${id}/reschedule`, data);
export const getPatientProfileApi = () => axiosInstance.get('/patients/profile');
export const updatePatientProfileApi = (data) => axiosInstance.put('/patients/profile', data);
