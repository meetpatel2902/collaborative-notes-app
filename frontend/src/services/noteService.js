     
import api from '../utils/api';

const getNotes = async () => {
  try {
    const response = await api.get('/notes');
    return Array.isArray(response.data) ? response.data : []; 
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notes');
  }
};

const getNoteById = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data || null; 
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch note');
  }
};

const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create note');
  }
};

const updateNote = async (id, noteData) => {
  try {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update note');
  }
};

const deleteNote = async (id) => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete note');
  }
};

const getAdminUsersAndNotes = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data || { users: [], notes: [] }; // ખાતરી કરો કે ડિફૉલ્ટ ડેટા મળે
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch admin data');
  }
};

const noteService = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getAdminUsersAndNotes,
};

export default noteService;