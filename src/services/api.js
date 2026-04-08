import axios from 'axios';

const api = axios.create({
  baseURL: 'https://campuscon-backend.vercel.app/api',
});

// Add a request interceptor to include the Firebase token
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
