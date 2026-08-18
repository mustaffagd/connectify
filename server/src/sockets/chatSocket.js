const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = new Map();

function chatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query(
        'SELECT id, username, email, profile_image, bio FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (result.rows.length === 0) {
        return next(new Error('User not found'));
      }
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${socket.user.username} (${userId})`);

    onlineUsers.set(userId, { socketId: socket.id, user: socket.user });

    User.updateLastSeen(userId).catch(console.error);

    io.emit('users-online', Array.from(onlineUsers.keys()));

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content } = data;
        if (!conversationId || !content || !content.trim()) return;

        const message = await Message.create({
          conversationId,
          senderId: userId,
          content: content.trim(),
        });

        const fullMessage = {
          ...message,
          sender_username: socket.user.username,
          sender_profile_image: socket.user.profile_image,
        };

        io.to(`conversation:${conversationId}`).emit('new-message', fullMessage);
      } catch (err) {
        console.error('Error sending message:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing-start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing-start', {
        userId,
        username: socket.user.username,
        conversationId,
      });
    });

    socket.on('typing-stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing-stop', {
        userId,
        conversationId,
      });
    });

    socket.on('mark-read', async (conversationId) => {
      try {
        await Message.markAsRead(conversationId, userId);
        socket.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          userId,
        });
      } catch (err) {
        console.error('Error marking read:', err.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      onlineUsers.delete(userId);
      await User.updateLastSeen(userId).catch(console.error);
      io.emit('users-online', Array.from(onlineUsers.keys()));
    });
  });
}

function getOnlineUsers() {
  return onlineUsers;
}

module.exports = { chatSocket, getOnlineUsers };
