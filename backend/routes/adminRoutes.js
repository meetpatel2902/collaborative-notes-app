const express = require('express');
const { getAllUsersAndNotes } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware'); // protect અને admin મિડલવેર
const router = express.Router();

// GET /api/admin/users - ફક્ત એડમિન માટે [cite: 8]
router.route('/users').get(protect, admin, getAllUsersAndNotes);

module.exports = router;