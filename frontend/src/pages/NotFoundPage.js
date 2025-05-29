import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-2xl mb-8">Page Not Found</p>
            <p className="text-lg text-center mb-10">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFoundPage;