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
    const graph = await client.graph(collection);
    return Response.json(graph);
  } catch {
    return Response.json({ nodes: [], edges: [] });
  }
}
