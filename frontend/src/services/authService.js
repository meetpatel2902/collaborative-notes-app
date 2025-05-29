
import api from '../utils/api';

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};


const signup = async (username, email, password, isAdmin, superAdminKey) => {
    const response = await api.post('/auth/signup', {
        username,
        email,
        password,
        isAdmin,         
        superAdminKey    
    });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    login,
    signup,
    logout,
};

export default authService;