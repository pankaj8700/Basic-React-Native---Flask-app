import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.158.103.52:5000'; // Match computer's local IP for phone connectivity

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
