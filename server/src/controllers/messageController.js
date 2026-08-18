const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const members = await Conversation.getConversationMembers(conversationId);
    const isMember = members.some((m) => m.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      content,
    });

    const fullMessage = {
      ...message,
      sender_username: req.user.username,
      sender_profile_image: req.user.profile_image,
    };

    res.status(201).json({ message: fullMessage });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const members = await Conversation.getConversationMembers(conversationId);
    const isMember = members.some((m) => m.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.findByConversation(conversationId, {
      limit: parseInt(limit),
      offset,
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

const markMessagesRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const members = await Conversation.getConversationMembers(conversationId);
    const isMember = members.some((m) => m.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    await Message.markAsRead(conversationId, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getMessages, markMessagesRead };
