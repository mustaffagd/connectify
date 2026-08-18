const { query } = require('../config/database');

const User = {
  async findById(id) {
    const result = await query(
      'SELECT id, username, email, profile_image, bio, created_at, updated_at, last_seen FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  async create({ username, email, passwordHash }) {
    const result = await query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, profile_image, bio, created_at, last_seen`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  async updateProfile(id, { username, bio, profile_image }) {
    const result = await query(
      `UPDATE users
       SET username = COALESCE($2, username),
           bio = COALESCE($3, bio),
           profile_image = COALESCE($4, profile_image),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, username, email, profile_image, bio, created_at, updated_at, last_seen`,
      [id, username, bio, profile_image]
    );
    return result.rows[0] || null;
  },

  async updateLastSeen(id) {
    await query('UPDATE users SET last_seen = NOW() WHERE id = $1', [id]);
  },

  async searchUsers(searchTerm, excludeUserId, limit = 20) {
    const result = await query(
      `SELECT id, username, email, profile_image, bio, last_seen
       FROM users
       WHERE (username ILIKE $1 OR email ILIKE $1)
         AND id != $2
       ORDER BY username
       LIMIT $3`,
      [`%${searchTerm}%`, excludeUserId, limit]
    );
    return result.rows;
  },

  async updatePassword(id, passwordHash) {
    await query(
      'UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1',
      [id, passwordHash]
    );
  },
};

module.exports = User;
