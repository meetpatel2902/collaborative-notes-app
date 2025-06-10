/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        const fetchedNotes = await noteService.getNotes();
        console.log('Fetched notes:', fetchedNotes); 
        setNotes(fetchedNotes);

        if (id) {
          const note = await noteService.getNoteById(id);
          if (note.owner._id !== user._id) {
            setError('You are not authorized to view or edit this note.');
            navigate('/');
            return;
          }
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags ? note.tags.join(', ') : '');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch notes.');
        console.error('Error fetching notes:', err);
        setLoading(false);
        if (err.response?.status === 404 || err.response?.status === 403) {
          navigate('/');
        }
      }
    };

    fetchNotes();

    if (id && user) {
      socket.connect();
      socket.emit('start_editing', id, user._id);

      socket.on('update_note_content', (noteId, newContent) => {
        if (noteId === id && content !== newContent) {
          setContent(newContent);
        }
      });

      socket.on('error', (message) => {
        console.error('Socket error:', message);
        setError(message);
      });

      return () => {
        if (id) {
          socket.emit('stop_editing', id, user._id);
          socket.disconnect();
          socket.off('update_note_content');
          socket.off('error');
        }
      };
    } else {
      setLoading(false);
    }
  }, [id, user, navigate, authLoading]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket.connected && id) {
      socket.emit('note_content_change', id, newContent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const noteData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if (id) {
        await noteService.updateNote(id, noteData);
        alert('Note updated successfully!');
      } else {
        await noteService.createNote(noteData);
        alert('Note created successfully!');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to save note.');
      console.error('Error saving note:', err);
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-lg">Loading note...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">{id ? 'Edit Note' : 'Create Note'}</h1>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <h2 className="text-xl font-bold mb-4">Your Notes</h2>
          <ul className="list-disc list-inside">
            {notes.length === 0 ? (
              <p className="text-gray-500">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <li key={note._id} className="mb-2">
                  <a
                    href={`/notes/${note._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {note.title}
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="w-3/4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                Title:
              </label>
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
              <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
                Content:
              </label>
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
              <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
                Tags (comma separated):
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., work, personal, important"
              />
            </div>
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
      </div>
    </div>
  );
};

export default NoteEditorPage;