const express = require('express');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/notes અને POST /api/notes બંને માટે [cite: 7]
router.route('/').get(protect, getNotes).post(protect, createNote);

// GET /api/notes/:id, PUT /api/notes/:id, DELETE /api/notes/:id બંને માટે [cite: 7]
router.route('/:id').get(protect, getNoteById).put(protect, updateNote).delete(protect, deleteNote);

module.exports = router;