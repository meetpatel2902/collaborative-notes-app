const express = require('express');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController'); 
console.log('getNotes:', getNotes);
const { protect, checkAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getNotes) 
    .post(protect, createNote);
router.route('/:id')
    .get(protect, getNoteById) 
    .put(protect, updateNote) 
    .delete(protect, deleteNote); 
module.exports = router;