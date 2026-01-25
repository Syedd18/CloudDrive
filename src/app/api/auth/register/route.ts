import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { registerSchema } from '@/lib/validation';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Register user
    const result = await authService.register(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Register error:', error);
    
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
}
