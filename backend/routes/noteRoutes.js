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

router.route('/')
    .get(protect, getNotes)
    .post(protect, createNote);
router.route('/:id')
    .get(protect, getNoteById)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;