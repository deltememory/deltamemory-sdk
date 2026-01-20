import { NextResponse } from "next/server";

// GET /api/sessions - List past legal sessions
export async function GET() {
  try {
    const baseUrl = process.env.DELTAMEMORY_URL || "http://localhost:6969";
    const apiKey = process.env.DELTAMEMORY_API_KEY;

    const response = await fetch(`${baseUrl}/v1/collections`, {
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "X-API-Key": apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter to only legal-session-* collections
    const legalSessions = (data.collections || [])
      .filter((c: string) => c.startsWith("legal-session-"))
      .map((c: string) => ({
        id: c.replace("legal-session-", ""),
        collection: c,
        name: c.replace("legal-session-", "").replace(/-/g, " "),
      }));

    return NextResponse.json({ sessions: legalSessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
