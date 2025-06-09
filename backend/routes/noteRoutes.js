const express = require('express');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
<<<<<<< HEAD
} = require('../controllers/noteController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id')
    .get(protect, getNoteById)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

=======
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
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
module.exports = router;