import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-blue-600 text-white p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                    MERN Notes App
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-lg">Welcome, {user.username}!</span>
                            {user.role === 'Admin' && (
                                <Link to="/admin/users" className="hover:text-blue-200">
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                onClick={logout}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-200">
                                Login
                            </Link>
                            <Link to="/signup" className="hover:text-blue-200">
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;