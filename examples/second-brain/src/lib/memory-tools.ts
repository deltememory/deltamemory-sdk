/**
 * Memory tool definitions for Azure GPT Realtime API
 * These match the tools configured in the token endpoint
 */

export type MemoryToolName = "save_to_memory" | "recall_memory" | "list_recent_memories";

export interface MemoryToolArgs {
  save_to_memory: { content: string; category?: string };
  recall_memory: { query: string };
  list_recent_memories: { limit?: number };
}
