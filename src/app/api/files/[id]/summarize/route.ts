import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeText, extractTags } from "@/lib/groq";
import * as mammoth from "mammoth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.middleware";

async function summarizeHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.user!.userId;
    const fileId = params.id;
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        sharedWith: {
          select: { email: true }
        }
      }
    });

    if (!file || file.type === "folder") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isOwner = file.userId === userId;
    const isSharedWithUser = file.sharedWith?.some((share: any) => share.email === request.user?.email);
    
    if (!isOwner && !isSharedWithUser && !file.isPublic) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return if already summarized and has tags
    if (file.summary && file.tags && file.tags.length > 0) {
      return NextResponse.json({ 
        summary: file.summary,
        tags: file.tags 
      });
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isTextFile = ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'rtf', 'csv'].includes(fileExt || '');

    if (!isTextFile && fileExt !== 'pdf' && fileExt !== 'docx') {
      return NextResponse.json({ error: "Unsupported file type for summarization" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(file.s3Key);

    if (downloadError || !fileData) {
      console.error(downloadError);
      return NextResponse.json({ error: "Settings file download failed" }, { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileExt === 'pdf') {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text;
    } else if (fileExt === 'docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      extractedText = fileBuffer.toString('utf-8');
    }

    const textToAnalyze = extractedText.substring(0, 3000);
    const summary = await summarizeText(textToAnalyze);
    const tags = await extractTags(textToAnalyze, file.name);

    await prisma.file.update({
      where: { id: file.id },
      data: { summary, tags }
    });

    return NextResponse.json({ summary, tags });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuth(request, (req) => summarizeHandler(req, context));
}

