/**
 * Error Handling Middleware
 * Centralizes error handling and standardized response formatting
 */

/**
 * Error response formatter
 * Converts errors into standardized API responses
 *
 * @param {Error} error - The error to format
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export function handleError(error, req, res) {
  console.error('API Error:', error);

  // App Error / Validation Error with status code
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message || 'Error',
      message: error.message || 'An error occurred',
      fields: error.fields || undefined,
      ...(error.context && error.context),
    });
  }

  // Validation error by name (400)
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.fields ? Object.values(error.fields).filter(Boolean).join(', ') : error.message,
      fields: error.fields || { general: error.message },
    });
  }

  // Conflict error by name (409)
  if (error.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: error.message || 'Resource conflict',
      ...(error.context && error.context),
    });
  }

  // Not found error by name (404)
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: error.message || 'Resource not found',
    });
  }

  // Prisma Database error (400/500)
  if (
    error.name === 'PrismaClientKnownRequestError' ||
    error.name === 'PrismaClientValidationError'
  ) {
    console.error('Database error:', error);
    // P2002: Unique constraint failed
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        error: 'Duplicate record',
        message: `An account or record with this ${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: error.message || 'An error occurred while processing your database request',
    });
  }

  // Default server error (500)
  return res.status(500).json({
    success: false,
    error: 'Server error',
    message: error.message || 'An unexpected server error occurred',
  });
}

/**
 * Error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, context = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(fields = {}) {
    const msg = typeof fields === 'string' ? fields : Object.values(fields).filter(Boolean).join(', ') || 'Validation failed';
    super(msg, 400);
    this.name = 'ValidationError';
    this.fields = typeof fields === 'object' ? fields : { general: fields };
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message, context = {}) {
    super(message, 409);
    this.name = 'ConflictError';
    this.context = context;
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Async error wrapper - wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error handling middleware
 */
export function errorHandlingMiddleware(err, req, res, next) {
  handleError(err, req, res);
}

export default {
  handleError,
  asyncHandler,
  errorHandlingMiddleware,
  AppError,
  ValidationError,
  ConflictError,
  NotFoundError,
};