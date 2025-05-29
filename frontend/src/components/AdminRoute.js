import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    
    if (!user) {
        return <Navigate to="/login" />;
    }

   
    if (user.role !== 'Admin') {
        return <Navigate to="/" />; 
    }

    return children; 
};

export default AdminRoute;