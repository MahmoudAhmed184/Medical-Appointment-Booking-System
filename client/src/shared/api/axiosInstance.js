import axios from 'axios';
import config from '../../config';

const axiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// TODO: Request interceptor — attach JWT token from localStorage
// TODO: Response interceptor — handle 401 redirect to /login

export default axiosInstance;
