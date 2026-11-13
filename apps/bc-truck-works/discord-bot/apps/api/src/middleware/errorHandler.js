function errorHandler(err, req, res, next) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Invalid request.',
      details: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { errorHandler };
