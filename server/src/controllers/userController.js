const User = require('../models/User');

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    const users = await User.searchUsers(q.trim(), req.user.id);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, profile_image } = req.body;

    if (username) {
      const existing = await User.findByUsername(username);
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const updated = await User.updateProfile(req.user.id, { username, bio, profile_image });
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchUsers, getUserById, updateProfile };
