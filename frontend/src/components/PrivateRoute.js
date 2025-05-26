import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // અથવા એક સુંદર લોડિંગ સ્પિનર
    }

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;