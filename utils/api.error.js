class ApiError extends Error {
  /**
   * @param {number} number
   * @param {string} message
   * @param {any[]} errors
   * @param {any} stack
   */

  constructor(statusCode, message, errors = [], stack) {
    super(message)
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = { ApiError};
