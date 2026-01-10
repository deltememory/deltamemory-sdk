/**
 * DeltaMemory Tools for Vercel AI SDK
 */

import { tool } from "ai"
import { z } from "zod"
import type { DeltaMemory } from "deltamemory"

/**
 * DeltaMemory tools configuration
 */
export interface DeltaMemoryToolsConfig {
	/** 
	 * User identifier for memory isolation.
	 * Each userId gets its own isolated memory space.
	 * This is used as the collection name: `user-${userId}`
	 */
	userId: string
	/** 
	 * Optional collection prefix (defaults to 'user').
	 * Final collection name: `${collectionPrefix}-${userId}`
	 * Use this to namespace different apps or environments.
	 * @example 'prod-user', 'staging-user', 'myapp-user'
	 */
	collectionPrefix?: string
	/** Optional metadata to attach to all operations */
	metadata?: Record<string, string>
}

/**
 * Create DeltaMemory tools for Vercel AI SDK.
 *
 * Provides two tools:
 * - recallMemory: Search past conversations and user context
 * - storeMemory: Store important information for future reference
 *
 * @param client - DeltaMemory client instance
 * @param config - Configuration with userId and optional settings
 * @returns Object with recallMemory and storeMemory tools
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai';
 * import { openai } from '@ai-sdk/openai';
 * import { deltaMemoryTools } from '@deltamemory/ai-sdk';
 * import { DeltaMemory } from 'deltamemory';
 *
 * const client = new DeltaMemory();
 *
 * // Each user gets isolated memory automatically
 * const { text } = await generateText({
 *   model: openai('gpt-4'),
 *   messages: [{ role: 'user', content: 'What are my preferences?' }],
 *   tools: {
 *     ...deltaMemoryTools(client, { userId: 'user-123' })
 *     // Memories stored in collection: 'user-user-123'
 *   }
 * });
 *
 * // With custom prefix for multi-app scenarios
 * const tools = deltaMemoryTools(client, { 
 *   userId: 'user-123',
 *   collectionPrefix: 'myapp'  // Collection: 'myapp-user-123'
 * });
 * ```
 */
export function deltaMemoryTools(
	client: DeltaMemory,
	config: DeltaMemoryToolsConfig,
) {
	const { userId, collectionPrefix = "user", metadata = {} } = config
	
	// Auto-create collection from userId for isolation
	// Each end-user gets their own isolated memory space
	const collection = `${collectionPrefix}-${userId}`

	const recallMemory = tool({
		description:
			"Search (recall) past conversations and user context to retrieve relevant memories. Run when explicitly asked or when context about user's past choices would be helpful.",
		inputSchema: z.object({
			query: z
				.string()
				.describe("What to search for in memory (e.g., 'user preferences', 'past meetings')"),
			limit: z
				.number()
				.optional()
				.default(5)
				.describe("Maximum number of memories to retrieve (default: 5)"),
		}),
		execute: async ({ query, limit = 5 }) => {
			try {
				const result = await client.recall(query, {
					collection,
					limit,
				})

				return {
					success: true,
					profiles:
						result.profiles?.map((p) => ({
							topic: p.topic,
							subTopic: p.sub_topic,
							content: p.content,
							confidence: p.confidence,
						})) || [],
					events:
						result.events?.map((e) => ({
							gist: e.gist,
							type: e.event_type,
							tags: e.tags,
						})) || [],
					context: result.context || "No relevant memories found.",
					memoryCount: result.results.length,
				}
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}
			}
		},
	})

	const storeMemory = tool({
		description:
			"Store (remember) important user information for future reference. Run when explicitly asked or when the user mentions any information generalizable beyond the context of the current conversation.",
		inputSchema: z.object({
			content: z
				.string()
				.describe("Information to remember (e.g., 'User prefers dark mode and TypeScript')"),
			importance: z
				.enum(["low", "medium", "high"])
				.optional()
				.default("medium")
				.describe("Importance level of this memory"),
		}),
		execute: async ({ content, importance = "medium" }) => {
			try {
				const result = await client.ingest(content, {
					collection,
					metadata: {
						...metadata,
						userId,
						importance,
						timestamp: new Date().toISOString(),
					},
				})

				return {
					success: true,
					memoryIds: result.memory_ids,
					extractedFacts: result.facts.map((f) => f.fact),
					extractedConcepts: result.concepts.map((c) => c.name),
				}
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}
			}
		},
	})

	return {
		recallMemory,
		storeMemory,
	}
}

// Export individual tool creators for more flexibility
export const recallMemoryTool = (
	client: DeltaMemory,
	config: DeltaMemoryToolsConfig,
) => {
	const { recallMemory } = deltaMemoryTools(client, config)
	return recallMemory
}

export const storeMemoryTool = (
	client: DeltaMemory,
	config: DeltaMemoryToolsConfig,
) => {
	const { storeMemory } = deltaMemoryTools(client, config)
	return storeMemory
}
