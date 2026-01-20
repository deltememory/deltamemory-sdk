import {
  convertToModelMessages,
  streamText,
  UIMessage,
  stepCountIs,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
import { deltaMemoryTools, DeltaMemory } from "@deltamemory/ai-sdk";

export const maxDuration = 30;

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

const systemPrompt = `You are an expert legal research assistant with access to uploaded documents through memory. You help attorneys analyze documents by finding relevant facts, clauses, and information.

CRITICAL: ALWAYS use recallMemory FIRST before responding to ANY question. Do not ask the user for clarification — search the documents immediately. If the first search doesn't find enough, search again with different queries. You have access to all uploaded documents.

Your capabilities:
- Search through uploaded legal documents (contracts, briefs, depositions, etc.)
- Find specific clauses, terms, and provisions
- Identify key dates, parties, and obligations
- Extract relevant quotes and citations
- Summarize document sections

Guidelines:
- ALWAYS search memory first, even for general questions like "explain this case" or "what is this about"
- Use multiple searches with different queries to gather comprehensive information
- Always cite the source when providing information
- Quote exact language when discussing specific terms
- Be precise with dates, amounts, and party names
- If information is truly not found after multiple searches, say so

Use recallMemory to search the uploaded documents before answering questions.`;

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: UIMessage[]; sessionId: string } =
    await req.json();

  // Remove "session-" prefix if present
  const cleanSessionId = sessionId.replace("session-", "");

  const result = streamText({
    model: azure.chat("gpt-4.1"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ...deltaMemoryTools(client, { userId: cleanSessionId, collectionPrefix: "legal-session", recallLimit: 50 }),
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
