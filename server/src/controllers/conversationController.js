const Conversation = require('../models/Conversation');

const createConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const existing = await Conversation.findExisting(req.user.id, userId);
    if (existing) {
      const members = await Conversation.getConversationMembers(existing.id);
      return res.json({ conversation: { id: existing.id, members } });
    }

    const conversation = await Conversation.create(req.user.id, userId);
    const members = await Conversation.getConversationMembers(conversation.id);
    res.status(201).json({ conversation: { ...conversation, members } });
  } catch (err) {
    next(err);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.getConversationsForUser(req.user.id);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const members = await Conversation.getConversationMembers(conversation.id);
    const isMember = members.some((m) => m.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }
    res.json({ conversation: { ...conversation, members } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createConversation, getConversations, getConversationById };
