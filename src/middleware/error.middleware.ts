import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON responses
 */
export async function handleErrors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // Log error
      logger.error('API Error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: request.method,
      });

      // Handle custom app errors
      if (error instanceof AppError) {
        return NextResponse.json(
          { 
            error: error.message,
            statusCode: error.statusCode 
          },
          { status: error.statusCode }
        );
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            error: error.message,
            statusCode: 400 
          },
          { status: 400 }
        );
      }

      // Handle unknown errors
      return NextResponse.json(
        { 
          error: 'Internal server error',
          statusCode: 500
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wraps a handler with error handling
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      logger.error('API Error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: request.method,
      });

      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
