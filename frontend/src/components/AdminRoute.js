import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // અથવા એક સુંદર લોડિંગ સ્પિનર
    }

    // જો યુઝર લૉગિન થયેલો ન હોય, તો લૉગિન પેજ પર રીડાયરેક્ટ કરો
    if (!user) {
        return <Navigate to="/login" />;
    }

    // જો યુઝર લૉગિન થયેલો હોય પણ એડમિન ન હોય, તો ડેશબોર્ડ પર રીડાયરેક્ટ કરો
    if (user.role !== 'Admin') {
        return <Navigate to="/" />; // અથવા કોઈ એક્સેસ ડેનાઇડ પેજ
    }

    return children; // જો યુઝર એડમિન હોય તો ચિલ્ડ્રન રેન્ડર કરો
};

export default AdminRoute;