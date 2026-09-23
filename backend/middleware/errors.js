const multer = require('multer');
const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'An unexpected server error occurred.';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(' ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'An account with that email already exists.';
  }

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 768 KB or smaller.'
        : error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'You can upload no more than five images.'
          : 'The image upload could not be processed.';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'An unexpected server error occurred.';
  }

  res.status(statusCode).json({ message });
}

module.exports = { errorHandler, notFound };
