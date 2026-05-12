import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.middleware";
import { withErrorHandler } from "@/middleware/error.middleware";
import { supabaseAdmin, STORAGE_BUCKET, updateFileInSupabase } from "@/lib/supabase";
import { isEditableFile } from "@/lib/utils";

interface RouteParams {
  params: {
    id: string;
  };
}

async function getContentHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const file = await prisma.file.findFirst({
    where: {
      id: params.id,
      userId: request.user!.userId,
    },
  });

  if (!file || file.type === "folder") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (!isEditableFile(file.name, file.mimeType)) {
    return NextResponse.json({ error: "This file type cannot be edited inline" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .download(file.s3Key);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to load file content" }, { status: 500 });
  }

  const content = await data.text();

  return NextResponse.json({
    content,
    mimeType: file.mimeType,
    name: file.name,
  });
}

async function updateContentHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content : "";

  const file = await prisma.file.findFirst({
    where: {
      id: params.id,
      userId: request.user!.userId,
    },
  });

  if (!file || file.type === "folder") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (!isEditableFile(file.name, file.mimeType)) {
    return NextResponse.json({ error: "This file type cannot be edited inline" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const buffer = Buffer.from(content, "utf-8");
  const updatedUrl = await updateFileInSupabase(file.s3Key, buffer, file.mimeType);

  await prisma.file.update({
    where: { id: file.id },
    data: {
      size: BigInt(buffer.byteLength),
      s3Url: updatedUrl,
      extractedText: content,
      summary: null,
      tags: [],
    },
  });

  return NextResponse.json({
    message: "File content updated successfully",
    content,
  });
}

export async function GET(request: NextRequest, context: RouteParams) {
  return requireAuth(request, (req) => withErrorHandler(() => getContentHandler(req, context))(req));
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return requireAuth(request, (req) => withErrorHandler(() => updateContentHandler(req, context))(req));
}