import axios from 'axios';

// Create base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('playportal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear storage
      const currentToken = localStorage.getItem('playportal_token');
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('playportal_token');
        localStorage.removeItem('playportal_user');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Health check helper
 */
export const checkApiHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
