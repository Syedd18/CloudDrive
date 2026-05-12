import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { search } = await request.json();
    if (!search) return NextResponse.json({ files: [] });

    // Perform basic semantic keyword search against extracted tags or summaries
    const files = await prisma.file.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: search.split(" ").map((s: string) => s.trim()) } }
        ],
        trashed: false
      },
      select: {
         id: true, name: true, type: true, size: true, mimeType: true,
         updatedAt: true, starred: true, trashed: true, isPublic: true,
         summary: true, tags: true
      },
      take: 20
    });

    const formattedFiles = files.map((file) => ({
      ...file,
      size: Number(file.size),
      modified: file.updatedAt.toISOString(),
      shared: file.isPublic
    }));

    return NextResponse.json({ files: formattedFiles });
  } catch (error) {
    return NextResponse.json({ error: "Semantic search failed" }, { status: 500 });
  }
}