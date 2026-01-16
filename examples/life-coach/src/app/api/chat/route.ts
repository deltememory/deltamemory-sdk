import {
  convertToModelMessages,
  streamText,
  UIMessage,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { deltaMemoryTools, DeltaMemory } from "@deltamemory/ai-sdk";

export const maxDuration = 30;

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

const systemPrompt = `You are a thoughtful life coach with deep memory. You remember everything about your clients - their goals, struggles, breakthroughs, relationships, and commitments.

Your approach:
- Remember personal history, relationships, career goals, and emotional patterns
- Notice behavioral patterns and recurring themes across conversations
- Gently reflect back what you've observed over time
- Hold people accountable to commitments they've made
- Connect dots between different areas of their life
- Celebrate growth, address regressions with empathy

Use recallMemory FIRST to check past context before every response.
Use storeMemory when users share: goals, relationships, commitments, struggles, breakthroughs, important life events, or preferences.

Be direct but warm. Reference specific past conversations when relevant. Show that you truly remember them.`;

export async function POST(req: Request) {
  const { messages, userId }: { messages: UIMessage[]; userId: string } =
    await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ...deltaMemoryTools(client, { userId, collectionPrefix: "lifecoach" }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
