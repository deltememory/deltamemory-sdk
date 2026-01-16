import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { deltaMemoryTools, DeltaMemory } from "@deltamemory/ai-sdk";
import { z } from "zod";
import { TUTOR_SYSTEM, PRACTICE_SYSTEM, AgentType } from "@/lib/agents";

export const maxDuration = 30;

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
});

// Mock tools for agent actions
const assessUnderstanding = tool({
  description: "Assess student's understanding of a topic and save insights",
  inputSchema: z.object({
    topic: z.string().describe("The topic being assessed"),
    studentResponse: z.string().describe("What the student said or did"),
    understanding: z.enum(["struggling", "partial", "solid", "mastered"]),
  }),
  execute: async ({ topic, studentResponse, understanding }) => {
    const assessments = {
      struggling: `Student needs more help with ${topic}. Consider different explanation approach.`,
      partial: `Student has basic understanding of ${topic}. Needs reinforcement with examples.`,
      solid: `Student grasped ${topic} well. Can introduce related advanced concepts.`,
      mastered: `Student has mastered ${topic}. Ready to move on to next topic.`,
    };
    return {
      assessment: assessments[understanding],
      recommendation:
        understanding === "struggling" || understanding === "partial"
          ? "Continue with TutorAgent for more explanation"
          : "Ready for PracticeAgent exercises",
    };
  },
});

const trackProgress = tool({
  description: "Track learning progress on a topic",
  inputSchema: z.object({
    topic: z.string().describe("The topic practiced"),
    exerciseType: z.string().describe("Type of exercise completed"),
    success: z.boolean().describe("Whether the student succeeded"),
    difficulty: z.enum(["easy", "medium", "hard"]),
  }),
  execute: async ({ topic, exerciseType, success, difficulty }) => {
    return {
      recorded: true,
      summary: `Progress tracked: ${topic} - ${exerciseType} (${difficulty}) - ${success ? "✓ Passed" : "✗ Needs practice"}`,
      nextStep: success
        ? "Can increase difficulty or move to new topic"
        : "Should retry with hints or easier version",
    };
  },
});

const generateExercise = tool({
  description: "Generate a practice exercise for the student",
  inputSchema: z.object({
    topic: z.string().describe("Topic for the exercise"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    exerciseType: z.enum(["code", "concept", "debug", "design"]),
  }),
  execute: async ({ topic, difficulty, exerciseType }) => {
    // Mock exercise generation
    const exercises: Record<string, Record<string, string>> = {
      easy: {
        code: `Write a simple function that demonstrates ${topic}`,
        concept: `Explain ${topic} in your own words`,
        debug: `Find the bug in this ${topic} code snippet`,
        design: `Sketch how you would use ${topic} in a small project`,
      },
      medium: {
        code: `Implement ${topic} with error handling`,
        concept: `Compare ${topic} with a related concept`,
        debug: `Fix multiple issues in this ${topic} implementation`,
        design: `Design a module using ${topic} principles`,
      },
      hard: {
        code: `Build a complete solution using ${topic} with edge cases`,
        concept: `Teach ${topic} to someone else with examples`,
        debug: `Optimize this ${topic} code for performance`,
        design: `Architect a system that heavily relies on ${topic}`,
      },
    };
    return {
      exercise: exercises[difficulty][exerciseType],
      hints: [`Think about the core purpose of ${topic}`, `Consider edge cases`],
      estimatedTime: difficulty === "easy" ? "5 min" : difficulty === "medium" ? "15 min" : "30 min",
    };
  },
});

export async function POST(req: Request) {
  const {
    messages,
    studentId,
    agent,
  }: { messages: UIMessage[]; studentId: string; agent: AgentType } =
    await req.json();

  const systemPrompt = agent === "tutor" ? TUTOR_SYSTEM : PRACTICE_SYSTEM;
  const memoryTools = deltaMemoryTools(client, {
    userId: studentId,
    collectionPrefix: "learning",
  });

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ...memoryTools,
      assessUnderstanding,
      trackProgress,
      generateExercise,
    },
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
