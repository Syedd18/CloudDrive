import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import { uploadFileToSupabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering for this route (uses cookies/auth)
export const dynamic = 'force-dynamic';

const authService = new AuthService();

// Get current user
async function getCurrentUserHandler(request: AuthenticatedRequest) {
  const user = await authService.getCurrentUser(request.user!.userId);
  return NextResponse.json({ user }, { status: 200 });
}

// Update user profile (including avatar)
async function updateProfileHandler(request: AuthenticatedRequest) {
  const formData = await request.formData();
  const avatarFile = formData.get('avatar') as File | null;
  const name = formData.get('name') as string | null;

  const updates: { name?: string; avatar?: string } = {};

  if (name) {
    updates.name = name;
  }

  if (avatarFile) {
    // Convert File to Buffer
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    
    // Create unique path for avatar
    const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
    const uniqueFilename = `avatar-${uuidv4()}.${fileExtension}`;
    const filePath = `avatars/${request.user!.userId}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const avatarUrl = await uploadFileToSupabase(filePath, buffer, avatarFile.type);
    updates.avatar = avatarUrl;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const user = await authService.updateProfile(request.user!.userId, updates);
  return NextResponse.json({ user }, { status: 200 });
}

export async function GET(request: NextRequest) {
  return requireAuth(request, withErrorHandler(getCurrentUserHandler));
}

export async function PATCH(request: NextRequest) {
  return requireAuth(request, withErrorHandler(updateProfileHandler));
}
