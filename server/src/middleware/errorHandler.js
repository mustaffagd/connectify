const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
