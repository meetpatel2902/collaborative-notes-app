import api from '../utils/api';

const getNotes = async () => {
    const response = await api.get('/notes');
    return response.data;
};

const getNoteById = async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
};

const createNote = async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
};

const updateNote = async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
};

const deleteNote = async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
};

const getAdminUsersAndNotes = async () => {
    const response = await api.get('/admin/users');
    return response.data;
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