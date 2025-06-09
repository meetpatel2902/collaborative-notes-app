import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';

const socket = io('https://collaborative-notes-backend.onrender.com', { withCredentials: true });

function NoteEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [editingUsers, setEditingUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await noteService.getNoteById(id);
        if (!data) {
          setError('Note not found.');
          return;
        }
        setNote(data);
        setTitle(data.title || '');
        setContent(data.content || '');
        setTags(data.tags || []);
        setIsPublic(data.isPublic || false);
        setCollaborators(data.collaborators || []);
      } catch (err) {
        setError('Failed to load note.');
        console.error('Error fetching note:', err);
      }
    };
    fetchNote();

   
    if (user && user.id && user.username) {
      socket.emit('start_editing', { noteId: id, userId: user.id, userName: user.username });

      socket.on('user_editing', ({ noteId, userId, userName }) => {
        if (noteId === id) {
          setEditingUsers((prev) => {
            
            if (prev.some((u) => u.userId === userId)) return prev;
            return [...prev, { userId, userName }];
          });
        }
      });

      socket.on('update_note_content', ({ noteId, content }) => {
        if (noteId === id) {
          setContent(content);
        }
      });

      socket.on('user_stopped_editing', ({ noteId, userId }) => {
        if (noteId === id) {
          setEditingUsers((prev) => prev.filter((u) => u.userId !== userId));
        }
      });
    }

    return () => {
      if (user && user.id) {
        socket.emit('stop_editing', { noteId: id, userId: user.id });
      }
      socket.disconnect();
    };
  }, [id, user, navigate]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    socket.emit('note_content_change', { noteId: id, content: newContent });
  };

  const handleSave = async () => {
    try {
     
      const collaboratorIds = collaborators
        .filter((collab) => collab._id) 
        .map((collab) => collab._id);

      await noteService.updateNote(id, {
        title,
        content,
        tags,
        isPublic,
        collaborators: collaboratorIds,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save note.');
      console.error('Error saving note:', err);
    }
  };

  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
  if (!note) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Note</h2>

      <div className="mb-4">
        <p className="text-gray-600">
          <strong>Currently Editing:</strong>{' '}
          {editingUsers.map((u) => u.userName).join(', ') || 'None'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Content</label>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full p-2 border rounded"
            rows="10"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map((tag) => tag.trim()))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Visibility</label>
          <select
            value={isPublic.toString()} 
            onChange={(e) => setIsPublic(e.target.value === 'true')}
            className="w-full p-2 border rounded"
          >
            <option value="false">Private</option>
            <option value="true">Public</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Collaborators (usernames, comma separated)
          </label>
          <input
            type="text"
            value={collaborators.map((c) => c.username).join(', ')}
            onChange={async (e) => {
              const usernames = e.target.value.split(',').map((u) => u.trim());
              try {
               
                const response = await fetch(
                  'https://collaborative-notes-backend.onrender.com/api/users/usernames-to-ids',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ usernames }),
                  }
                );
                const data = await response.json();
                if (response.ok) {
                  setCollaborators(data.users || []);
                } else {
                  setError('Failed to fetch collaborator IDs.');
                }
              } catch (err) {
                setError('Error fetching collaborator IDs.');
                console.error('Error fetching collaborator IDs:', err);
              }
            }}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteEditPage;