import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const SignupPage = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSignup = async (username, email, password, isAdmin, superAdminKey) => {
        try {
            const userData = await signup(username, email, password, isAdmin, superAdminKey);
            if (userData.role === 'Admin') {
                navigate('/admin/users'); 
            } else {
                navigate('/');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="signup" onSubmit={handleSignup} errorMessage={errorMessage} />
        </div>
    );
};

export default SignupPage;