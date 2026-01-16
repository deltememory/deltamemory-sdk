import { DeltaMemory } from "@deltamemory/ai-sdk";

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId required" }, { status: 400 });
  }

  const collection = `lifecoach-${userId}`;

  try {
    const start = performance.now();
    const stats = await client.stats(collection);
    const statsTime = performance.now() - start;

    return Response.json({
      ...stats,
      latency: {
        stats: Math.round(statsTime),
      },
    });
  } catch {
    return Response.json({
      memory_count: 0,
      fact_count: 0,
      profile_count: 0,
      event_count: 0,
      latency: { stats: 0 },
    });
  }
}
