const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const paginate = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

module.exports = { generateId, formatDate, sanitizeInput, paginate };
