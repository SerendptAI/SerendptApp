import { Env } from '@env';
import axios from 'axios';

import { getToken } from '@/lib/auth/utils';

export const client = axios.create({
  baseURL: Env.API_URL,
});

// Add a request interceptor to include auth token in requests
client.interceptors.request.use(
  (config) => {
     console.log('response', config);
    // Get the auth token from storage
    const token = getToken();
    // If token exists, add it to the Authorization header
    if (token?.access) {
      config.headers.Authorization = `Bearer ${token.access}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);
