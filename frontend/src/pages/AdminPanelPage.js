import React, { useState, useEffect } from 'react';
import noteService from '../services/noteService'; // noteService માં admin ફંક્શન ઉમેરો

const AdminPanelPage = () => {
    const [usersWithNotes, setUsersWithNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsersAndNotes = async () => {
            try {
                setLoading(true);
                const data = await noteService.getAdminUsersAndNotes();
                setUsersWithNotes(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError(err.response?.data?.message || 'Failed to fetch admin data. Access denied.');
                setLoading(false);
            }
        };

        fetchUsersAndNotes();
    }, []);

    if (loading) {
        return <div className="text-center mt-8">Loading admin data...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel - All Users & Notes</h1>

            {usersWithNotes.length === 0 ? (
                <p className="text-center text-gray-600">No users found.</p>
            ) : (
                <div className="space-y-8">
                    {usersWithNotes.map((user) => (
                        <div key={user._id} className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-blue-700">
                                User: {user.username} ({user.email}) - Role: {user.role}
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                            <h3 className="text-lg font-medium mb-3">Notes:</h3>
                            {user.notes && user.notes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.notes.map((note) => (
                                        <div key={note._id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <h4 className="font-semibold text-gray-800">{note.title}</h4>
                                            <p className="text-gray-600 text-sm line-clamp-2">{note.content}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Created: {new Date(note.createdAt).toLocaleDateString()} | Updated: {new Date(note.updatedAt).toLocaleDateString()}
                                            </p>
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {note.tags.map((tag, idx) => (
                                                        <span key={idx} className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No notes for this user.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPanelPage;