import { NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email;
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { resetUrl } = await authService.requestPasswordReset(email);

    // In production you'd send the resetUrl by email. For now return it for dev.
    return NextResponse.json({ message: 'If an account exists you will receive reset instructions', resetUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
