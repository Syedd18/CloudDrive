import { NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token;
    const password = body?.password;
    if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });

    await authService.resetPassword(token, password);

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 400 });
  }
}
