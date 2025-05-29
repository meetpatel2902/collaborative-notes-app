const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const adminController = require('../controllers/adminController'); 


router.get('/users', authMiddleware.protect, authMiddleware.checkAdmin, adminController.getAllUsersAndNotes);

module.exports = router;