import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const data = await noteService.getNotes();
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch notes. Please try again.');
        setLoading(false);
        console.error('Error fetching notes:', err);
      }
    };

    fetchNotes();
  }, [user, navigate]);

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.deleteNote(id);
        setNotes(notes.filter((note) => note._id !== id));
      } catch (err) {
        setError('Failed to delete note. ' + (err.response?.data?.message || err.message));
        console.error('Error deleting note:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Notes</h2>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate('/create-note')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md"
        >
          Create New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No notes found. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{note.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>

              {note.owner && (
                <p className="text-gray-500 text-xs mb-1">
                  <strong>Owner:</strong> {note.owner.username || 'Unknown'}
                </p>
              )}

              {note.collaborators && note.collaborators.length > 0 && (
                <p className="text-gray-500 text-xs mb-2">
                  <strong>Collaborators:</strong> {note.collaborators.map(collab => collab.username).join(', ')}
                </p>
              )}

              <p className="text-gray-500 text-xs mb-2">
                <strong>Visibility:</strong> {note.isPublic ? 'Public' : 'Private'}
              </p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => navigate(`/notes/${note._id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  View/Edit
                </button>

                {user && note.owner && (note.owner._id === user._id || user.role === 'Admin') && (
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;