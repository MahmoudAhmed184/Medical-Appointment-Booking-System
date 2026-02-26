import axiosInstance from '../../../shared/api/axiosInstance';

export const getDoctorsApi = (params) => axiosInstance.get('/doctors', { params });
export const getDoctorByIdApi = (id) => axiosInstance.get(`/doctors/${id}`);
export const bookAppointmentApi = (data) => axiosInstance.post('/patients/appointments', data);
export const getMyAppointmentsApi = () => axiosInstance.get('/patients/appointments');
export const cancelAppointmentApi = (id) => axiosInstance.patch(`/patients/appointments/${id}/cancel`);
export const rescheduleAppointmentApi = (id, data) => axiosInstance.patch(`/patients/appointments/${id}/reschedule`, data);
export const getPatientProfileApi = () => axiosInstance.get('/patients/profile');
export const updatePatientProfileApi = (data) => axiosInstance.put('/patients/profile', data);
