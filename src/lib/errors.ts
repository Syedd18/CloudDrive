import logger from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(403, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(409, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, false);
  }
}

export function handleError(error: Error | AppError) {
  if (error instanceof AppError) {
    logger.error(`${error.name}: ${error.message}`, {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      stack: error.stack,
    });
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  // Unhandled errors
  logger.error('Unhandled error:', error);
  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
  };
}
