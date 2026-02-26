import axiosInstance from '../../../shared/api/axiosInstance';

export const getUsersApi = (params) => axiosInstance.get('/users', { params });
export const approveUserApi = (id) => axiosInstance.patch(`/users/${id}/approve`);
export const blockUserApi = (id) => axiosInstance.patch(`/users/${id}/block`);
export const deleteUserApi = (id) => axiosInstance.delete(`/users/${id}`);
export const getSpecialtiesApi = () => axiosInstance.get('/specialties');
export const createSpecialtyApi = (data) => axiosInstance.post('/specialties', data);
export const updateSpecialtyApi = (id, data) => axiosInstance.put(`/specialties/${id}`, data);
export const deleteSpecialtyApi = (id) => axiosInstance.delete(`/specialties/${id}`);
export const getAllAppointmentsApi = (params) => axiosInstance.get('/appointments/all', { params });
