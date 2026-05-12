import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateFileInSupabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Verify Token and Get Folder info
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const link = await prisma.fileDropLink.findUnique({
      where: { token: params.token, isActive: true },
      include: { user: { select: { name: true, avatar: true } }, folder: { select: { name: true, userId: true } } }
    });

    if (!link) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    return NextResponse.json({ link });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Upload File publicly via Drop Link
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const link = await prisma.fileDropLink.findUnique({
      where: { token: params.token, isActive: true },
      include: { folder: true }
    });

    if (!link) return NextResponse.json({ error: "Invalid link" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
    const filePath = `${link.folder.userId}/${uniqueFilename}`;
    
    const fileUrl = await updateFileInSupabase(filePath, buffer, file.type);
    
    // Calculate type
    let fileType = "file" as any;
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type === 'application/pdf') fileType = 'pdf';
    else if (file.type.includes('document') || file.type.includes('text') || file.name.endsWith('.md')) fileType = 'document';

    // Insert record under the folder owner's ID
    const newFile = await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        type: fileType,
        size: BigInt(file.size),
        mimeType: file.type,
        s3Key: filePath,
        s3Url: fileUrl,
        userId: link.folder.userId,
        folderId: link.folderId,
      }
    });

    // Increment downloads count (or uploads counter)
    await prisma.fileDropLink.update({
      where: { id: link.id },
      data: { downloads: { increment: 1 } }
    });

    return NextResponse.json({ success: true, file: { id: newFile.id, name: newFile.name } });
  } catch (e: any) {
    console.error("Drop Upload Error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}