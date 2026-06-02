import axios from 'axios';
import { getUser } from '../utils/auth';

/**
 * Configure axios to automatically include JWT token in requests
 */
const setupAxiosInterceptors = () => {
  // Request interceptor - add token to every request
  axios.interceptors.request.use(
    (config) => {
      const user = getUser();
      if (user) {
        // Get token from localStorage - backend sends it during login
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - clear user and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));
        // Optional: redirect to login page
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
