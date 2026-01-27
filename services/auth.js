import api from './api';
import * as SecureStore from 'expo-secure-store';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
        await SecureStore.setItemAsync('userToken', response.data.access_token);
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    if (response.data.access_token) {
        await SecureStore.setItemAsync('userToken', response.data.access_token);
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
};

export const getCurrentUser = async () => {
    const user = await SecureStore.getItemAsync('userData');
    return user ? JSON.parse(user) : null;
};
