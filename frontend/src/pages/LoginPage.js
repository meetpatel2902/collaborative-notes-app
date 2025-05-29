import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (email, password) => {
        try {
            const userData = await login(email, password);
            if (userData.role === 'Admin') {
                navigate('/admin/users'); 
            } else {
                navigate('/'); 
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="login" onSubmit={handleLogin} errorMessage={errorMessage} />
        </div>
    );
};

export default LoginPage;