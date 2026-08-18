const express = require('express');
const { searchUsers, getUserById, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { profileUpdateValidation, handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

router.get('/search', requireAuth, searchUsers);
router.get('/:id', requireAuth, getUserById);
router.put('/profile', requireAuth, profileUpdateValidation, handleValidationErrors, updateProfile);

module.exports = router;
