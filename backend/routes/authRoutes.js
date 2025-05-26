const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', registerUser); // /auth/signup [cite: 7]
router.post('/login', authUser);     // /auth/login [cite: 7]

module.exports = router;