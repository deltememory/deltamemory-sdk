import { NextRequest, NextResponse } from "next/server";

/**
 * Token endpoint - generates ephemeral token for WebRTC connection
 * This proxies the request to Azure OpenAI to keep credentials server-side
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") || "default";
  
  let endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-realtime";

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: "Azure OpenAI credentials not configured" },
      { status: 500 }
    );
  }

  // Clean up endpoint - extract base URL if it has extra paths
  // Handle formats like: https://resource.openai.azure.com/openai/realtime
  // or https://resource.cognitiveservices.azure.com/openai/realtime
  const urlMatch = endpoint.match(/^(https:\/\/[^\/]+)/);
  if (urlMatch) {
    endpoint = urlMatch[1];
  }
  endpoint = endpoint.replace(/\/$/, "");

  // Memory tools in OpenAI function format
  const tools = [
    {
      name: "save_to_memory",
      type: "function",
      description: "Save important information to the user's second brain for future reference. Use this when the user shares ideas, facts, preferences, or anything worth remembering.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The information to save. Be descriptive and include context.",
          },
          category: {
            type: "string",
            description: "Category of the memory: idea, fact, task, preference, note, or insight",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "recall_memory",
      type: "function",
      description: "Search the user's second brain to retrieve relevant memories. Use when the user asks about something they mentioned before or when context would help.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for in memory.",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "list_recent_memories",
      type: "function",
      description: "List the most recent memories saved to the second brain. Use when the user wants to review what they've been thinking about.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of recent memories to retrieve (default: 5)",
          },
        },
        required: [],
      },
    },
  ];

  const systemPrompt = `You are a helpful AI assistant acting as the user's "second brain" - a personal knowledge management system.

CRITICAL RULE: You MUST call recall_memory BEFORE answering ANY question or responding to ANY topic. Never respond based on assumptions - always check the user's memories first.

Your workflow for EVERY interaction:
1. FIRST: Call recall_memory with a relevant query about the topic
2. THEN: Use the retrieved context to inform your response
3. If the user shares new information: Call save_to_memory to store it

Your role is to:
- Help the user capture and organize their thoughts, ideas, and information
- Remember important details they share with you
- Recall relevant information when asked
- Make connections between different pieces of information
- Be proactive about saving important information the user mentions

Tool usage rules:
- ALWAYS call recall_memory FIRST before responding to any question
- Use save_to_memory when the user shares ideas, facts, preferences, or anything worth remembering
- Use list_recent_memories when the user wants to review what they've been thinking about
- If recall_memory returns no results, acknowledge that and ask if they'd like to tell you about it

Be conversational and natural. You're like a trusted assistant who never forgets - but you must always check your memory before speaking.`;

  // Session configuration matching Azure OpenAI Realtime API format
  const sessionConfig = {
    model: deploymentName,
    voice: "verse",
    instructions: systemPrompt,
    input_audio_transcription: {
      model: "whisper-1",
    },
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,
      interrupt_response: true,
    },
    tools,
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
    temperature: 0.8,
    max_response_output_tokens: "inf",
  };

  try {
    // Request session from Azure OpenAI Realtime API
    const sessionsUrl = `${endpoint}/openai/realtimeapi/sessions?api-version=2025-04-01-preview`;
    
    console.log("Requesting session from:", sessionsUrl);
    console.log("Deployment:", deploymentName);

    const response = await fetch(sessionsUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Session request failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Session request failed: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    const ephemeralToken = sessionData.client_secret?.value;

    if (!ephemeralToken) {
      console.error("No token in response:", sessionData);
      return NextResponse.json(
        { error: "No ephemeral token in response" },
        { status: 500 }
      );
    }

    // Extract region from endpoint for WebRTC URL
    // Format: https://resource-region.cognitiveservices.azure.com
    const hostname = new URL(endpoint).hostname;
    const regionMatch = hostname.match(/-([a-z0-9]+)\.cognitiveservices\.azure\.com/);
    const region = regionMatch ? regionMatch[1] : "eastus2";
    
    return NextResponse.json({
      token: ephemeralToken,
      endpoint,
      webrtcUrl: `https://${region}.realtimeapi-preview.ai.azure.com/v1/realtimertc`,
      region,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session creation failed" },
      { status: 500 }
    );
  }
}
