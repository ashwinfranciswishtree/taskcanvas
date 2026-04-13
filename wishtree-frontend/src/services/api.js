import axios from 'axios';

<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
=======
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
>>>>>>> dd6b6519e8604450fac8d6c50f5ecf5a09f4070a
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
