const express = require('express');
const { sendMessage, getMessages, markMessagesRead } = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');
const { messageValidation, handleValidationErrors } = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.post('/', requireAuth, messageValidation, handleValidationErrors, sendMessage);
router.get('/', requireAuth, getMessages);
router.put('/read', requireAuth, markMessagesRead);

module.exports = router;
