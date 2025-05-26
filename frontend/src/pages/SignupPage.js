import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const SignupPage = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSignup = async (username, email, password) => {
        try {
            await signup(username, email, password);
            navigate('/'); // સફળ સાઇનઅપ પર ડેશબોર્ડ પર રીડાયરેક્ટ કરો
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm type="signup" onSubmit={handleSignup} errorMessage={errorMessage} />
            <div className="absolute bottom-4 text-gray-600">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </div>
        </div>
    );
};

export default SignupPage;