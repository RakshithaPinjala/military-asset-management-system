import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://military-asset-management-system-pu4u.onrender.com/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
