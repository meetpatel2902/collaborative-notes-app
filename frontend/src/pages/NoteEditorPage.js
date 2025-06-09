/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import noteService from '../services/noteService';
import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client';
import userService from '../services/userService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://collaborative-notes-backend.onrender.com';
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
  const [isPublic, setIsPublic] = useState(false);
  const [currentNoteCollaborators, setCurrentNoteCollaborators] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentEditor, setCurrentEditor] = useState(null);
  const [lockedBy, setLockedBy] = useState(null);
  const [originalNoteOwner, setOriginalNoteOwner] = useState(null);

  const [activeCollaborators, setActiveCollaborators] = useState({});
  const otherRealtimeCollaborators = Object.keys(activeCollaborators).filter(
    (collab) => collab !== user?.username
  );

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket.connected && id) {
      socket.emit('note_content_change', id, newContent);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchNoteAndUsers = async () => {
      let fetchedNote = null;
      if (id) {
        try {
          fetchedNote = await noteService.getNoteById(id);
          if (!fetchedNote) {
            setError('Note not found.');
            navigate('/');
            return;
          }
          setTitle(fetchedNote.title || '');
          setContent(fetchedNote.content || '');
          setTags(fetchedNote.tags ? fetchedNote.tags.join(', ') : '');
          setIsPublic(fetchedNote.isPublic || false);
          setCurrentNoteCollaborators(
            fetchedNote.collaborators ? fetchedNote.collaborators.map((c) => c._id) : []
          );
          setOriginalNoteOwner(fetchedNote.owner || null);
          setLockedBy(fetchedNote.lockedBy ? fetchedNote.lockedBy.username : null);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch note.');
          console.error('Error fetching note:', err);
          if (err.response?.status === 404 || err.response?.status === 403) {
            navigate('/');
          }
          setLoading(false);
          return;
        }
      }

      try {
        const allUsersResponse = await userService.getAllUsers();
        const allUsers = allUsersResponse.users || [];

        const filteredUsers = allUsers.filter((u) => {
          if (u._id === user._id) return false;
          if (fetchedNote) {
            if (fetchedNote.owner && u._id === fetchedNote.owner._id) return false;
            if (fetchedNote.collaborators && fetchedNote.collaborators.some((collab) => collab._id === u._id))
              return false;
          }
          return true;
        });
        setAvailableUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching available users for collaborators:', err);
        setError('Failed to fetch available users.');
      }
      setLoading(false);
    };

    fetchNoteAndUsers();

    if (id && user) {
      socket.connect();
      socket.emit('start_editing', id, user.username);

      socket.on('user_editing', (noteId, username) => {
        if (username !== user.username) {
          setActiveCollaborators((prev) => ({ ...prev, [username]: true }));
          setCurrentEditor(username);
        }
      });

      socket.on('user_stopped_editing', (noteId, username) => {
        if (username !== user.username) {
          setActiveCollaborators((prev) => {
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

      socket.on('note_locked', (noteId, lockedByUsername) => {
        if (noteId === id) {
          setLockedBy(lockedByUsername);
        }
      });

      socket.on('note_unlocked', (noteId) => {
        if (noteId === id) {
          setLockedBy(null);
        }
      });

      return () => {
        if (id) {
          socket.emit('stop_editing', id, user.username);
          socket.disconnect();
          socket.off('user_editing');
          socket.off('user_stopped_editing');
          socket.off('update_note_content');
          socket.off('note_locked');
          socket.off('note_unlocked');
        }
      };
    }
  }, [id, user, navigate, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const noteData = {
      title,
      content,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isPublic,
      collaborators: currentNoteCollaborators,
    };

    try {
      if (id) {
        await noteService.updateNote(id, noteData);
        alert('Note updated successfully!');
        navigate('/');
      } else {
        await noteService.createNote(noteData);
        alert('Note created successfully!');
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save note.';
      if (errorMessage.includes('A note with this title already exists')) {
        setError('A note with this title already exists. Please choose a different title.');
      } else {
        setError(errorMessage);
      }
      console.error('Error saving note:', err);
    }
  };

  const handleAddCollaborator = (e) => {
    const selectedUserId = e.target.value;
    const selectedUserObj = availableUsers.find((u) => u._id === selectedUserId);

    if (selectedUserObj && !currentNoteCollaborators.includes(selectedUserId)) {
      setCurrentNoteCollaborators((prev) => [...prev, selectedUserId]);
      setAvailableUsers((prev) => prev.filter((u) => u._id !== selectedUserId));
    }
  };

  const handleRemoveCollaborator = (userIdToRemove) => {
    setCurrentNoteCollaborators((prev) => prev.filter((id) => id !== userIdToRemove));

    const userToRestore =
      availableUsers.find((u) => u._id === userIdToRemove) ||
      (originalNoteOwner && originalNoteOwner._id === userIdToRemove ? originalNoteOwner : null);
    if (userToRestore) {
      setAvailableUsers((prev) => [...prev, userToRestore]);
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-lg">Loading note...</div>;
  }

  const isNewNote = !id;
  const isOwner = user && originalNoteOwner && originalNoteOwner._id === user.id;
  const isCollaborator = user && currentNoteCollaborators.includes(user.id);
  const isAdmin = user && user.role === 'Admin';

  const canEdit = isNewNote || isOwner || isCollaborator || isAdmin;

  if (error.includes('Not authorized to view this note') && !canEdit && !isNewNote) {
    return (
      <div className="text-center mt-8 text-red-600 font-semibold">
        You are not authorized to view or edit this note.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">{id ? 'Edit Note' : 'Create Note'}</h1>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {lockedBy && lockedBy !== user?.username && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Note Locked!</p>
          <p>This note is currently locked by {lockedBy}. You cannot save changes.</p>
        </div>
      )}

      {currentEditor && currentEditor !== user?.username && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p className="font-bold">Live Editing!</p>
          <p>{currentEditor} is currently editing this note.</p>
        </div>
      )}

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
            disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
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
            disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
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
            disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
          />
          <label htmlFor="isPublic" className="text-gray-700 text-sm font-bold">
            Make this note Public
          </label>
        </div>

        {(!isNewNote && (isOwner || isAdmin)) && (
          <div className="mb-4">
            <label htmlFor="addCollaborator" className="block text-gray-700 text-sm font-bold mb-2">
              Manage Collaborators:
            </label>
            <select
              id="addCollaborator"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              onChange={handleAddCollaborator}
              value=""
              disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
            >
              <option value="">Select a user to add...</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <h4 className="text-gray-700 text-sm font-bold mb-1">Current Collaborators:</h4>
              {currentNoteCollaborators.length === 0 ? (
                <p className="text-gray-500 text-sm">No collaborators added yet.</p>
              ) : (
                <ul className="list-disc list-inside">
                  {currentNoteCollaborators.map((collabId) => {
                    const collabUser =
                      availableUsers.find((u) => u._id === collabId) ||
                      (originalNoteOwner && originalNoteOwner._id === collabId ? originalNoteOwner : null);

                    return (
                      <li key={collabId} className="flex items-center justify-between py-1 text-gray-700">
                        {collabUser ? collabUser.username : 'Unknown User'}
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(collabId)}
                          className="ml-2 bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded"
                          disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!canEdit || (lockedBy && lockedBy !== user?.username)}
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