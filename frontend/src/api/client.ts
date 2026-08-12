import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
if (rawBaseUrl && !rawBaseUrl.endsWith('api') && !rawBaseUrl.endsWith('api/')) {
    rawBaseUrl = rawBaseUrl.endsWith('/') ? `${rawBaseUrl}api` : `${rawBaseUrl}/api`;
}

export const apiClient = axios.create({
  baseURL: rawBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
