const { query } = require('../config/database');

const Message = {
  async create({ conversationId, senderId, content }) {
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, senderId, content]
    );
    const message = result.rows[0];

    await query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    return message;
  },

  async findByConversation(conversationId, { limit = 50, offset = 0 } = {}) {
    const result = await query(
      `SELECT m.*, u.username AS sender_username, u.profile_image AS sender_profile_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows.reverse();
  },

  async markAsRead(conversationId, userId) {
    await query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE conversation_id = $1
         AND sender_id != $2
         AND read_at IS NULL`,
      [conversationId, userId]
    );
  },

  async getUnreadCount(conversationId, userId) {
    const result = await query(
      `SELECT COUNT(*)::int AS count
       FROM messages
       WHERE conversation_id = $1
         AND sender_id != $2
         AND read_at IS NULL`,
      [conversationId, userId]
    );
    return result.rows[0].count;
  },
};

module.exports = Message;
