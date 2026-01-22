/**
 * Error handling utilities for consistent error management
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
  }
}

/**
 * Handle server errors consistently
 * Logs unexpected errors and returns user-friendly messages
 */
export function handleServerError(error: unknown): { error: string } {
  if (error instanceof AppError) {
    return { error: error.message }
  }

  // Log unexpected errors for debugging
  if (error instanceof Error) {
    console.error('Unexpected error:', error.message, error.stack)
  } else {
    console.error('Unexpected error:', error)
  }

  // Don't expose internal errors to users
  return { error: 'An unexpected error occurred. Please try again.' }
}
