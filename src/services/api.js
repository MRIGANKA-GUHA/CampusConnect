import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:5000/api'
    : 'https://campuscon-backend.vercel.app/api',
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on any 401 (session expired on backend)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local state and redirect to login
      localStorage.removeItem('token');
      // Avoid import cycle — just redirect directly
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
