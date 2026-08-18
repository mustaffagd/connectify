const { query } = require('../config/database');

const Conversation = {
  async findById(id) {
    const result = await query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findExisting(userId1, userId2) {
    const result = await query(
      `SELECT c.id
       FROM conversations c
       JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = $1
       JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = $2
       WHERE (
         SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id
       ) = 2
       LIMIT 1`,
      [userId1, userId2]
    );
    return result.rows[0] || null;
  },

  async create(userId1, userId2) {
    const client = await require('../config/database').pool.connect();
    try {
      await client.query('BEGIN');
      const convResult = await client.query(
        'INSERT INTO conversations DEFAULT VALUES RETURNING *'
      );
      const conversation = convResult.rows[0];

      await client.query(
        'INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)',
        [conversation.id, userId1, userId2]
      );

      await client.query('COMMIT');
      return conversation;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getConversationMembers(conversationId) {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.profile_image, u.last_seen
       FROM users u
       JOIN conversation_members cm ON u.id = cm.user_id
       WHERE cm.conversation_id = $1`,
      [conversationId]
    );
    return result.rows;
  },

  async getConversationsForUser(userId) {
    const result = await query(
      `SELECT
        c.id,
        c.created_at,
        c.updated_at,
        (
          SELECT json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'profile_image', u.profile_image,
            'last_seen', u.last_seen
          )
          FROM users u
          JOIN conversation_members cm ON u.id = cm.user_id
          WHERE cm.conversation_id = c.id AND u.id != $1
          LIMIT 1
        ) AS other_user,
        (
          SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'sender_id', m.sender_id,
            'created_at', m.created_at
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND m.read_at IS NULL
        )::int AS unread_count
       FROM conversations c
       JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = $1
       ORDER BY
         COALESCE(
           (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
           c.created_at
         ) DESC`,
      [userId]
    );
    return result.rows;
  },
};

module.exports = Conversation;
