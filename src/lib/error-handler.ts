import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor({ message, statusCode = 400, code = 'BAD_REQUEST', details }: AppErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Secure Server-side Logging
  console.error('[SERVER_ERROR_LOG]', {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.stack || error.message : error,
  });

  // Zod Validation Error (Immediate Rejection)
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return NextResponse.json(
      {
        error: 'Validation Failed',
        message: 'Invalid request payload provided.',
        statusCode: 400,
        details: formattedErrors,
      },
      { status: 400 }
    );
  }

  // Known Custom Application Error
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
        statusCode: error.statusCode,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  // Generic Sanitized Internal Server Error (No stack trace, no file paths)
  return NextResponse.json(
    {
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      statusCode: 500,
    },
    { status: 500 }
  );
}
