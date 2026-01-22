import { NextRequest, NextResponse } from "next/server";
import { DeltaMemory } from "deltamemory";

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") || "alex";
  const collection = `secondbrain-${userId}`;

  try {
    // Pass collection as string directly, not as object
    const stats = await client.stats(collection);
    
    // Map DeltaMemory response (snake_case) to component format (camelCase)
    return NextResponse.json({
      memoryCount: stats.memory_count ?? 0,
      factCount: stats.fact_count ?? 0,
      conceptCount: stats.concept_count ?? 0,
      profileCount: stats.profile_count ?? 0,
      eventCount: stats.event_count ?? 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({
      memoryCount: 0,
      factCount: 0,
      conceptCount: 0,
      profileCount: 0,
      eventCount: 0,
    });
  }
}
