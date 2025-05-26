import React, { useState, useEffect } from 'react';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';

const DashboardPage = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const data = await noteService.getNotes();
            setNotes(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError('Failed to fetch notes.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            const newTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            const newNote = await noteService.createNote({ title, content, tags: newTags });
            setNotes([newNote, ...notes]); // નવી નોટને ટોચ પર ઉમેરો
            setTitle('');
            setContent('');
            setTags('');
            setError('');
        } catch (err) {
            console.error('Error creating note:', err);
            setError(err.response?.data?.message || 'Failed to create note.');
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await noteService.deleteNote(id);
                setNotes(notes.filter((note) => note._id !== id));
                setError('');
            } catch (err) {
                console.error('Error deleting note:', err);
                setError(err.response?.data?.message || 'Failed to delete note.');
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading notes...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">My Notes</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create New Note</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleCreateNote}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
                        <textarea
                            id="content"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={1000}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
                        <input
                            type="text"
                            id="tags"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., react, nodejs, mern"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Create Note
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                    <p className="text-center col-span-full text-gray-600">No notes yet. Create one above!</p>
                ) : (
                    notes.map((note) => (
                        <NoteCard key={note._id} note={note} onDelete={handleDeleteNote} />
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardPage;