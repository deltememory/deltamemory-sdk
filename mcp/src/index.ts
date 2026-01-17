/**
 * DeltaMemory MCP Server
 * 
 * Provides cognitive memory capabilities to AI assistants via MCP.
 * 
 * Environment variables:
 * - DELTAMEMORY_API_KEY: API key for authentication (required)
 * - DELTAMEMORY_URL: Server endpoint URL (required)
 * - DELTAMEMORY_COLLECTION: Default collection name (optional, defaults to 'default')
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DeltaMemory } from "deltamemory";
import {
  IngestSchema,
  RecallSchema,
  StoreSchema,
  GetMemorySchema,
  DeleteMemorySchema,
  DecaySchema,
  ConsolidateSchema,
  ReflectSchema,
  CollectionSchema,
  EmptySchema,
} from "./schemas.js";

// Environment configuration
const API_KEY = process.env.DELTAMEMORY_API_KEY;
const BASE_URL = process.env.DELTAMEMORY_URL;
const DEFAULT_COLLECTION = process.env.DELTAMEMORY_COLLECTION || "default";

if (!API_KEY || !BASE_URL) {
  console.error("ERROR: DELTAMEMORY_API_KEY and DELTAMEMORY_URL environment variables are required");
  process.exit(1);
}

// Initialize DeltaMemory client
const client = new DeltaMemory({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  defaultCollection: DEFAULT_COLLECTION,
});

// Create MCP server
const server = new McpServer({
  name: "deltamemory-mcp-server",
  version: "0.1.0",
});

// === Tool Registrations ===

server.registerTool(
  "deltamemory_ingest",
  {
    title: "Ingest Memory",
    description: `Ingest content with full cognitive processing. Automatically extracts facts, concepts, user profiles, and events.

Use this to store important information the user shares - preferences, facts about themselves, plans, etc.

Returns: memory IDs, extracted facts, and concepts.`,
    inputSchema: IngestSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (params) => {
    const result = await client.ingest(params.content, {
      collection: params.collection,
      datetime: params.datetime,
      speaker: params.speaker,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "deltamemory_recall",
  {
    title: "Recall Memories",
    description: `Search memories using hybrid cognitive search. Combines semantic similarity, recency, and salience.

Returns memories, user profiles, events, and pre-formatted context for LLM use.

Use this to retrieve relevant information about the user or past conversations.`,
    inputSchema: RecallSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    const result = await client.recall(params.query, {
      collection: params.collection,
      limit: params.limit,
    });
    return { content: [{ type: "text", text: result.context || JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "deltamemory_store",
  {
    title: "Store Memory",
    description: `Store content without cognitive processing (raw mode). Use for simple storage without fact extraction.`,
    inputSchema: StoreSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (params) => {
    const result = await client.store(params.content, {
      collection: params.collection,
      memoryType: params.memoryType,
    });
    return { content: [{ type: "text", text: `Stored memory with ID: ${result.id}` }] };
  }
);

server.registerTool(
  "deltamemory_get",
  {
    title: "Get Memory",
    description: `Retrieve a specific memory by its ID.`,
    inputSchema: GetMemorySchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    const result = await client.get(params.id, params.collection);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "deltamemory_delete",
  {
    title: "Delete Memory",
    description: `Delete a memory by its ID. This action is irreversible.`,
    inputSchema: DeleteMemorySchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    await client.delete(params.id, params.collection);
    return { content: [{ type: "text", text: `Deleted memory: ${params.id}` }] };
  }
);

server.registerTool(
  "deltamemory_stats",
  {
    title: "Collection Stats",
    description: `Get statistics for a collection including memory count, facts, concepts, profiles, and events.`,
    inputSchema: CollectionSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    const result = await client.stats(params.collection);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "deltamemory_decay",
  {
    title: "Apply Decay",
    description: `Apply salience decay to memories. Reduces importance of older memories over time.`,
    inputSchema: DecaySchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (params) => {
    const result = await client.decay(params.rate, params.collection);
    return { content: [{ type: "text", text: `Applied decay to ${result.affected_count} memories` }] };
  }
);

server.registerTool(
  "deltamemory_consolidate",
  {
    title: "Consolidate Memories",
    description: `Merge similar memories to reduce redundancy and improve recall quality.`,
    inputSchema: ConsolidateSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (params) => {
    const result = await client.consolidate(params.threshold, params.collection);
    return { content: [{ type: "text", text: `Consolidated ${result.consolidated_count} memory groups` }] };
  }
);

server.registerTool(
  "deltamemory_reflect",
  {
    title: "Generate Reflection",
    description: `Generate insights from recent memories. Useful for summarizing patterns and key information.`,
    inputSchema: ReflectSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (params) => {
    const result = await client.reflect(params.windowSize, params.collection);
    return { content: [{ type: "text", text: result.reflection }] };
  }
);

server.registerTool(
  "deltamemory_graph",
  {
    title: "Get Knowledge Graph",
    description: `Retrieve the knowledge graph with concepts and their relationships.`,
    inputSchema: CollectionSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    const result = await client.graph(params.collection);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "deltamemory_purge",
  {
    title: "Purge Collection",
    description: `Delete ALL memories in a collection. This action is irreversible. Use with extreme caution.`,
    inputSchema: CollectionSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  },
  async (params) => {
    const result = await client.purge(params.collection);
    return { content: [{ type: "text", text: `Purged ${result.deleted_count} memories` }] };
  }
);

server.registerTool(
  "deltamemory_health",
  {
    title: "Health Check",
    description: `Check DeltaMemory server health and version.`,
    inputSchema: EmptySchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async () => {
    const result = await client.health();
    return { content: [{ type: "text", text: `Server healthy: ${result.healthy}, version: ${result.version}` }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DeltaMemory MCP server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
