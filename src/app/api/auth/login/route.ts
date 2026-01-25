import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { loginSchema } from '@/lib/validation';
import { withErrorHandler } from '@/middleware/error.middleware';
import { rateLimit } from '@/middleware/rateLimit.middleware';

const authService = new AuthService();

// Login user
async function loginHandler(request: NextRequest) {
  // Validate request body
  const body = await request.json();
  const validatedData = loginSchema.parse(body);

  // Login user
  const result = await authService.login(validatedData);

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  return rateLimit(request, withErrorHandler(loginHandler));
}
