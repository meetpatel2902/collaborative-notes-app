import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // લોડિંગ સ્ટેટ

    useEffect(() => {
        // જ્યારે કમ્પોનન્ટ માઉન્ટ થાય, ત્યારે લોકલસ્ટોરેજમાંથી યુઝર મેળવો
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // લોડિંગ પૂર્ણ થયું
    }, []);

    const login = async (email, password) => {
        const userData = await authService.login(email, password);
        setUser(userData);
        return userData;
    };

    const signup = async (username, email, password) => {
        const userData = await authService.signup(username, email, password);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children} {/* જ્યારે લોડિંગ સમાપ્ત થાય ત્યારે જ ચિલ્ડ્રનને રેન્ડર કરો */}
        </AuthContext.Provider>
    );
};

export default AuthContext;