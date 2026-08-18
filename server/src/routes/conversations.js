const express = require('express');
const { createConversation, getConversations, getConversationById } = require('../controllers/conversationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createConversation);
router.get('/', requireAuth, getConversations);
router.get('/:id', requireAuth, getConversationById);

module.exports = router;
