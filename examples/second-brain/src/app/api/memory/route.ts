import { NextRequest, NextResponse } from "next/server";
import { DeltaMemory } from "deltamemory";

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

export async function POST(req: NextRequest) {
  const { action, userId, ...params } = await req.json();
  const collection = `secondbrain-${userId}`;

  try {
    switch (action) {
      case "save": {
        const { content, category } = params;
        const result = await client.ingest(content, {
          collection,
          metadata: {
            category: category || "note",
            timestamp: new Date().toISOString(),
          },
        });
        return NextResponse.json({
          success: true,
          memoryIds: result.memory_ids,
          facts: result.facts.map((f) => f.fact),
          concepts: result.concepts.map((c) => c.name),
        });
      }

      case "recall": {
        const { query, limit = 10 } = params;
        const result = await client.recall(query, {
          collection,
          limit,
        });
        return NextResponse.json({
          success: true,
          context: result.context || "No relevant memories found.",
          memories: result.results.map((r) => ({
            content: r.memory.content,
          })),
          profiles: result.profiles || [],
          events: result.events || [],
        });
      }

      case "recent": {
        const { limit = 5 } = params;
        // Use a broad query to get recent memories
        const result = await client.recall("recent notes ideas thoughts", {
          collection,
          limit,
        });
        return NextResponse.json({
          success: true,
          memories: result.results.map((r) => ({
            content: r.memory.content,
          })),
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Memory operation failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
