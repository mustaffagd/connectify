const { query } = require('../config/database');

const Call = {
  async create({ callerId, receiverId }) {
    const result = await query(
      `INSERT INTO calls (caller_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [callerId, receiverId]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      `UPDATE calls
       SET status = $2, ended_at = CASE WHEN $2 IN ('ended', 'rejected', 'missed') THEN NOW() ELSE ended_at END
       WHERE id = $1
       RETURNING *`,
      [id, status]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query('SELECT * FROM calls WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getActiveCall(userId) {
    const result = await query(
      `SELECT * FROM calls
       WHERE (caller_id = $1 OR receiver_id = $1)
         AND status IN ('pending', 'accepted')
       ORDER BY started_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = Call;
