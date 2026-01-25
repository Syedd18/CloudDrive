import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { registerSchema } from '@/lib/validation';
import { withErrorHandler } from '@/middleware/error.middleware';
import { rateLimit } from '@/middleware/rateLimit.middleware';

const authService = new AuthService();

// Register new user
async function registerHandler(request: NextRequest) {
  // Validate request body
  const body = await request.json();
  const validatedData = registerSchema.parse(body);

  // Register user
  const result = await authService.register(validatedData);

  return NextResponse.json(result, { status: 201 });
}

export async function POST(request: NextRequest) {
  return rateLimit(request, withErrorHandler(registerHandler));
}
