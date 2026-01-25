import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  folderId: z.string().optional(),
});

async function createFolderHandler(request: NextRequest) {
  const body = await request.json();
  const { name, folderId } = createFolderSchema.parse(body);
  
  const user = (request as any).user;

  // Create folder in database
  const folder = await prisma.file.create({
    data: {
      name,
      originalName: name,
      type: 'folder',
      size: BigInt(0),
      mimeType: 'application/vnd.google-apps.folder',
      s3Key: `folders/${user.userId}/${Date.now()}-${name}`,
      s3Url: '',
      folderId: folderId || null,
      userId: user.userId,
    },
  });

  return NextResponse.json({
    success: true,
    folder: {
      ...folder,
      size: folder.size.toString(),
    },
  }, { status: 201 });
}

export const POST = (request: NextRequest) =>
  requireAuth(request, (req) => withErrorHandler(() => createFolderHandler(req))(req));
