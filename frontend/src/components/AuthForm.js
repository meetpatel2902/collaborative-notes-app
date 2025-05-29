
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 

const AuthForm = ({ type, onSubmit, errorMessage }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
   
    const [isAdmin, setIsAdmin] = useState(false);
   
    const [superAdminKey, setSuperAdminKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
       
        if (type === 'signup' && isAdmin) {
          
            onSubmit(username, email, password, isAdmin, superAdminKey);
        } else if (type === 'signup') {
         
            onSubmit(username, email, password, false, ''); 
        } else {
               onSubmit(email, password);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {type === 'signup' ? 'Sign Up' : 'Login'}
            </h2>
            {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

            {type === 'signup' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
            )}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email:
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password:
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="******************"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {type === 'signup' && (
                <>
                    <div className="mb-4 flex items-center">
                        <input
                            id="isAdmin"
                            type="checkbox"
                            className="mr-2 leading-tight"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                        />
                        <label className="text-gray-700 text-sm font-bold" htmlFor="isAdmin">
                            Register as Admin
                        </label>
                    </div>

                    {isAdmin && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="superAdminKey">
                                Super Admin Key:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="superAdminKey"
                                type="password"
                                placeholder="Enter Super Admin Key"
                                value={superAdminKey}
                                onChange={(e) => setSuperAdminKey(e.target.value)}
                                required={isAdmin}
                            />
                        </div>
                    )}
                </>
            )}

            <div className="flex items-center justify-center">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    {type === 'signup' ? 'Sign Up' : 'Login'}
                </button>
            </div>
            {type === 'login' ? (
                <div className="text-center mt-4">
                    Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
                </div>
            ) : (
                <div className="text-center mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </div>
            )}
        </form>
    );
};

export default AuthForm;