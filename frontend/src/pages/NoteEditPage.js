import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';

const socket = io('http://localhost:5000', { withCredentials: true });

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
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags || []);
        setIsPublic(data.isPublic || false);
        setCollaborators(data.collaborators || []);
      } catch (err) {
        setError('Failed to load note.');
        console.error('Error fetching note:', err);
      }
    };
    fetchNote();

    // Socket.IO ઇવેન્ટ્સ
    socket.emit('start_editing', { noteId: id, userId: user.id, userName: user.username });

    socket.on('user_editing', ({ noteId, userId, userName }) => {
      if (noteId === id) {
        setEditingUsers((prev) => [...prev, { userId, userName }]);
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

    return () => {
      socket.emit('stop_editing', { noteId: id, userId: user.id });
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
      await noteService.updateNote(id, {
        title,
        content,
        tags,
        isPublic,
        collaborators,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save note.');
      console.error('Error saving note:', err);
    }
  };

  if (!note) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

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
            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Visibility</label>
          <select
            value={isPublic}
            onChange={(e) => setIsPublic(e.target.value === 'true')}
            className="w-full p-2 border rounded"
          >
            <option value={false}>Private</option>
            <option value={true}>Public</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Collaborators (usernames, comma separated)</label>
          <input
            type="text"
            value={collaborators.map(c => c.username).join(', ')}
            onChange={(e) => {
              const usernames = e.target.value.split(',').map(u => u.trim());
              setCollaborators(usernames.map(username => ({ username })));
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