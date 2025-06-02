import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },
    (error) => {
        
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token'); 
            
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;