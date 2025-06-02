import React, { useState, useEffect,  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL, {
    autoConnect: false, 
    withCredentials: true, 
});

const NoteEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [collaborators, setCollaborators] = useState({}); 
    const [currentEditor, setCurrentEditor] = useState(null); 

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchNote = async () => {
            if (id) {
                try {
                    const note = await noteService.getNoteById(id);
                    setTitle(note.title);
                    setContent(note.content);
                    setTags(note.tags ? note.tags.join(', ') : '');
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch note.');
                }
            }
            setLoading(false);
        };

        fetchNote();

       
        if (id && user) {
            socket.connect(); 
            socket.emit('start_editing', id, user.username);

            socket.on('user_editing', (noteId, username) => {
                if (username !== user.username) {
                    setCollaborators(prev => ({ ...prev, [username]: true }));
                    setCurrentEditor(username);
                }
            });

            socket.on('user_stopped_editing', (noteId, username) => {
                if (username !== user.username) {
                    setCollaborators(prev => {
                        const newCollaborators = { ...prev };
                        delete newCollaborators[username];
                        return newCollaborators;
                    });
                    setCurrentEditor(null);
                }
            });

            socket.on('update_note_content', (noteId, newContent) => {
                if (noteId === id && content !== newContent) { 
                    setContent(newContent);
                }
            });

            
            return () => {
                socket.emit('stop_editing', id, user.username);
                socket.disconnect();
                socket.off('user_editing');
                socket.off('user_stopped_editing');
                socket.off('update_note_content');
            };
        }

    }, [id, user, navigate, content]);

   
    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (socket.connected) {
            socket.emit('note_content_change', id, newContent);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const noteData = {
                title,
                content,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            };

            if (id) {
                await noteService.updateNote(id, noteData);
                alert('Note updated successfully!');
            } else {
                await noteService.createNote(noteData);
                alert('Note created successfully!');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save note.');
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading note...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
    }

    const otherCollaborators = Object.keys(collaborators).filter(collab => collab !== user.username);

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">{id ? 'Edit Note' : 'Create Note'}</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        maxLength="100"
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={handleContentChange}
                        rows="10"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        maxLength="1000"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma separated):</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., work, personal, important"
                    />
                </div>

                {id && (
                    <div className="mt-4 text-sm text-gray-600">
                        {currentEditor && currentEditor !== user.username && (
                            <p className="font-semibold text-blue-600">
                                {currentEditor} is currently editing this note.
                            </p>
                        )}
                        {otherCollaborators.length > 0 && (
                            <p>
                                Other collaborators: {otherCollaborators.join(', ')}
                            </p>
                        )}
                        {!currentEditor && otherCollaborators.length === 0 && (
                            <p>No one else is currently editing this note.</p>
                        )}
                    </div>
                )}


                <div className="flex items-center justify-between mt-6">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {id ? 'Update Note' : 'Create Note'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NoteEditorPage;