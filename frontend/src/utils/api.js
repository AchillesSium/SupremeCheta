import axios from 'axios';

const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API URL:', BASE_API_URL); // Log the API URL being used

const api = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    config => {
        console.log('Making request to:', config.url, 'with data:', config.data);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    response => {
        console.log('Response received:', response.data);
        return response;
    },
    error => {
        console.error('Response error:', error.response?.data || error.message);
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject({ message });
    }
);

export const login = async (credentials) => {
    try {
        console.log('Attempting login with:', credentials);
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        console.log('Attempting registration with:', userData);
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export default api;