import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeText, extractTags } from "@/lib/groq";
import * as mammoth from "mammoth";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.middleware";

async function summarizeHandler(request: AuthenticatedRequest) {
  try {
    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
      console.error('GROQ_API_KEY is not configured');
      return NextResponse.json(
        { error: "AI summarization is not configured. Please set GROQ_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    const isTextFile = ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'csv', 'rtf'].includes(fileExt || '');
    const isPDF = fileExt === 'pdf';
    const isDocx = fileExt === 'docx';

    if (!isTextFile && !isPDF && !isDocx) {
      return NextResponse.json({ 
        error: "Unsupported file type. Supported: PDF, DOCX, TXT, MD, JS, TS, HTML, CSS, JSON, Python, CSV" 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    try {
      if (isPDF) {
        try {
          const pdfParse = require("pdf-parse/lib/pdf-parse.js");
          // pdf-parse expects the buffer directly
          const pdfData = await pdfParse(fileBuffer);
          extractedText = (pdfData.text || "").trim();
          
          if (!extractedText) {
            throw new Error("PDF contains no extractable text or is encrypted");
          }
        } catch (err) {
          console.error("PDF parse error:", err);
          throw new Error(`Failed to extract PDF text: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else if (isDocx) {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = (result.value || "").trim();
          
          if (!extractedText) {
            throw new Error("DOCX contains no extractable text");
          }
        } catch (err) {
          console.error("DOCX parse error:", err);
          throw new Error(`Failed to extract DOCX text: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        // Text-based files
        try {
          extractedText = fileBuffer.toString('utf-8').trim();
          
          if (!extractedText) {
            throw new Error("File contains no text");
          }
        } catch (err) {
          console.error("Text file parse error:", err);
          throw new Error(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (parseError) {
      console.error("Error parsing file:", parseError);
      const errorMsg = parseError instanceof Error ? parseError.message : "Failed to parse file content";
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    const textToAnalyze = extractedText.substring(0, 3000);
    const summary = await summarizeText(textToAnalyze);
    
    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary. Please try again." },
        { status: 500 }
      );
    }

    const tags = await extractTags(textToAnalyze, fileName);

    return NextResponse.json({ summary, tags, fileName });
  } catch (error) {
    console.error("Summarization error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to summarize file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(request, summarizeHandler);
}
