import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            navigate('/'); // સફળ લૉગિન પર ડેશબોર્ડ પર રીડાયરેક્ટ કરો
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="login" onSubmit={handleLogin} errorMessage={errorMessage} />
            <div className="absolute bottom-4 text-gray-600">
                Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
            </div>
        </div>
    );
};

export default LoginPage;