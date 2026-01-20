import { NextRequest, NextResponse } from "next/server";
import { DeltaMemory } from "deltamemory";
import { extractText } from "unpdf";

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

// Store upload progress in memory (in production, use Redis or similar)
const uploadProgress = new Map<string, {
  status: "parsing" | "ingesting" | "complete" | "error";
  progress: number;
  total: number;
  message: string;
  error?: string;
}>();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const sessionId = formData.get("sessionId") as string;
  const fileName = formData.get("fileName") as string;

  if (!file || !sessionId) {
    return NextResponse.json({ error: "Missing file or sessionId" }, { status: 400 });
  }

  // Initialize progress
  uploadProgress.set(sessionId, {
    status: "parsing",
    progress: 0,
    total: 0,
    message: "Parsing PDF...",
  });

  try {
    // Parse PDF using unpdf
    const buffer = await file.arrayBuffer();
    const result = await extractText(new Uint8Array(buffer));
    const text = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;

    // Split into chunks (by pages or paragraphs)
    const chunks = splitIntoChunks(text, 2000); // ~2000 chars per chunk
    const total = chunks.length;

    uploadProgress.set(sessionId, {
      status: "ingesting",
      progress: 0,
      total,
      message: `Ingesting ${total} sections...`,
    });

    const collection = `legal-session-${sessionId}`;

    // Purge existing data for this session
    try {
      await client.purge(collection);
    } catch {
      // Collection might not exist
    }

    // Ingest chunks with progress
    for (let i = 0; i < chunks.length; i++) {
      await client.ingest(chunks[i], {
        collection,
        speaker: "Document",
        metadata: {
          fileName: fileName || file.name,
          chunkIndex: String(i),
          totalChunks: String(total),
        },
      });

      uploadProgress.set(sessionId, {
        status: "ingesting",
        progress: i + 1,
        total,
        message: `Ingesting section ${i + 1} of ${total}...`,
      });

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 100));
    }

    // Wait for extraction
    uploadProgress.set(sessionId, {
      status: "ingesting",
      progress: total,
      total,
      message: "Processing memories...",
    });

    await new Promise((r) => setTimeout(r, 3000));

    // Get final stats
    const stats = await client.stats(collection);

    uploadProgress.set(sessionId, {
      status: "complete",
      progress: total,
      total,
      message: `Complete! ${stats.memory_count} memories, ${stats.fact_count} facts extracted.`,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      chunks: total,
      stats,
    });
  } catch (error: any) {
    uploadProgress.set(sessionId, {
      status: "error",
      progress: 0,
      total: 0,
      message: "Upload failed",
      error: error.message,
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get upload progress
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const progress = uploadProgress.get(sessionId);
  
  if (!progress) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  return NextResponse.json(progress);
}

// Split text into chunks
function splitIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  
  // First try to split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = "";
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter((c) => c.length > 50); // Filter out tiny chunks
}
