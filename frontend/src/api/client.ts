import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://forty-hats-dress.loca.lt/api',
});

apiClient.interceptors.request.use((config) => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  const token = localStorage.getItem('mams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
