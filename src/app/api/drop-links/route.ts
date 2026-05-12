import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  return requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { folderId, name, description } = await req.json();

      // Verify folder ownership
      const folder = await prisma.file.findFirst({
        where: { id: folderId, userId: req.user!.userId, type: "folder", trashed: false }
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      const token = crypto.randomBytes(32).toString('hex');

      const dropLink = await prisma.fileDropLink.create({
        data: {
          folderId,
          userId: req.user!.userId,
          name: name || `Drop into ${folder.name}`,
          description,
          token
        }
      });

      return NextResponse.json({ link: dropLink });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const links = await prisma.fileDropLink.findMany({
        where: { userId: req.user!.userId, isActive: true },
        include: { folder: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json({ links });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}