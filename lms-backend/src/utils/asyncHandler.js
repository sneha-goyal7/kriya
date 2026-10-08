/**
 * Async Handler
 * Wraps async route handlers to automatically catch errors
 * and forward them to the global error handler.
 * Eliminates repetitive try/catch blocks in every controller.
 *
 * Usage: router.get('/users', asyncHandler(getUsers));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
