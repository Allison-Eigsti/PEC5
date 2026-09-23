class AppError extends Error {
  constructor(message, statusCode = 500, expose = false) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.expose = expose;
  }
}

module.exports = AppError;
