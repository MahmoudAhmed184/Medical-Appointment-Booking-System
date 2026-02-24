import axios from 'axios';
import config from '../../config';

const axiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((requestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            // Temporary for patient-module testing until auth frontend is ready.
            // Do not hard-redirect globally; let pages handle unauthorized UI.
            error.isUnauthorized = true;
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
