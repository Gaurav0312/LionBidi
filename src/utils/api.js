// src/utils/api.js
import axios from 'axios';

// Backend base URLs
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

  export const apiFetch = (endpoint, options = {}) => {
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // if you use cookies/auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};

// Dynamically pick correct base URL
// let BASE_URL;
// if (window.location.hostname === "localhost") {
//   BASE_URL = BASE_URLS.localhost;
// } else if (window.location.hostname.startsWith("10.86.")) {
//   BASE_URL = BASE_URLS.lan;
// } else {
//   BASE_URL = BASE_URLS.production;
// }

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
