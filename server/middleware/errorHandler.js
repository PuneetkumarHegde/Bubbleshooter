// Centralized Global Error Handler - Never leaks stack traces to client
export function errorHandler(err, req, res, next) {
  console.error('[Server Error]', err);

  const status = err.statusCode || 500;
  const message = err.message || 'An unexpected internal game server error occurred.';

  res.status(status).json({
    success: false,
    message,
  });
}
