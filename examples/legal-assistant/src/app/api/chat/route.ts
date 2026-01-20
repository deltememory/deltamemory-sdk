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

const systemPrompt = `You are an expert legal research assistant with access to case documents through memory. You help attorneys analyze cases by finding relevant facts, identifying contradictions, and building timelines.

CRITICAL: ALWAYS use recallMemory FIRST before responding to ANY question. Do not ask the user for clarification — search the documents immediately. If the first search doesn't find enough, search again with different queries. You have access to all case documents.

Your capabilities:
- Search through contracts, depositions, emails, and meeting notes
- Find specific clauses and terms in agreements
- Identify contradictions between witness statements
- Build chronological timelines of events
- Calculate and explain damages
- Connect facts across multiple documents (multi-hop reasoning)

Guidelines:
- ALWAYS search memory first, even for general questions like "explain this case"
- Use multiple searches with different queries to gather comprehensive information
- Always cite the source document and date when providing information
- Quote exact language from contracts when discussing terms
- Note any contradictions or inconsistencies you find
- Be precise with dates and amounts
- If information is truly not found after multiple searches, say so

Reference specific documents: "According to the MSA dated June 15, 2023..." or "In her deposition, Sarah Chen stated..."`;

export async function POST(req: Request) {
  const { messages, caseId }: { messages: UIMessage[]; caseId: string } =
    await req.json();

  const collection = `legal-${caseId}`;

  const result = streamText({
    model: azure.chat("gpt-4.1"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ...deltaMemoryTools(client, { userId: caseId, collectionPrefix: "legal", recallLimit: 50 }),
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
