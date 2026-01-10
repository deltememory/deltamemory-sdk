/**
 * DeltaMemory TypeScript Client
 */

import {
  DeltaMemoryConfig,
  IngestOptions,
  IngestResponse,
  RecallOptions,
  RecallResponse,
  StoreOptions,
  StoreResponse,
  Memory,
  DecayResponse,
  ConsolidateResponse,
  ReflectResponse,
  StatsResponse,
  PurgeResponse,
  GraphResponse,
  HealthResponse,
} from './types';
import { DeltaMemoryError, ConnectionError, parseError } from './errors';

const DEFAULT_BASE_URL = 'http://localhost:6969';
const DEFAULT_TIMEOUT = 30000;

/**
 * DeltaMemory client for interacting with the DeltaMemory server.
 * 
 * @example
 * ```typescript
 * const db = new DeltaMemory({ 
 *   apiKey: 'dm_your_api_key_here',
 *   defaultCollection: 'my-app' 
 * });
 * 
 * // Ingest content with cognitive processing
 * const result = await db.ingest('User prefers dark mode');
 * 
 * // Recall relevant memories with profiles and events
 * const memories = await db.recall('What are the user preferences?');
 * console.log(memories.profiles);  // Structured user facts
 * console.log(memories.events);    // Timeline events
 * console.log(memories.context);   // Pre-formatted LLM context
 * ```
 */
export class DeltaMemory {
  private readonly baseUrl: string;
  private readonly defaultCollection: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;

  constructor(config: DeltaMemoryConfig = {}) {
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.defaultCollection = config.defaultCollection || 'default';
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    
    // Build headers with API key if provided
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    
    if (config.apiKey) {
      this.headers['X-API-Key'] = config.apiKey;
    }
  }


  /**
   * Make an HTTP request to the DeltaMemory server.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as { error?: string; code?: string };
        parseError(response.status, errorBody);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DeltaMemoryError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ConnectionError(`Request timeout after ${this.timeout}ms`);
        }
        throw new ConnectionError(error.message);
      }
      
      throw new ConnectionError('Unknown error occurred');
    }
  }

  /**
   * Get the collection name, using default if not provided.
   */
  private getCollection(collection?: string): string {
    return collection || this.defaultCollection;
  }

  /**
   * Ingest content with cognitive processing.
   * 
   * This method:
   * - Generates embeddings for the content
   * - Extracts facts and concepts using LLM
   * - Extracts user profiles and events (structured memory)
   * - Stores the memory with full cognitive metadata
   * 
   * @param content - The content to ingest
   * @param options - Optional settings (collection, metadata, datetime, speaker)
   * @returns Ingest result with memory IDs, extracted facts, and concepts
   * 
   * @example
   * ```typescript
   * const result = await db.ingest('I prefer TypeScript over JavaScript', {
   *   metadata: { source: 'chat' },
   *   datetime: '2024-01-15T10:30:00Z',
   *   speaker: 'user'
   * });
   * console.log(result.facts); // Extracted facts
   * ```
   */
  async ingest(content: string, options: IngestOptions = {}): Promise<IngestResponse> {
    const metadata: Record<string, string> = { ...(options.metadata || {}) };
    
    if (options.datetime) {
      metadata.datetime = options.datetime;
    }
    if (options.speaker) {
      metadata.speaker = options.speaker;
    }
    
    return this.request<IngestResponse>('POST', '/v1/ingest', {
      collection: this.getCollection(options.collection),
      content,
      metadata,
    });
  }

  /**
   * Recall memories using hybrid cognitive search.
   * 
   * Combines:
   * - Semantic similarity (vector search)
   * - Temporal recency
   * - Salience scoring
   * - User profiles (structured facts)
   * - User events (timeline)
   * - Graph knowledge (multi-hop reasoning)
   * 
   * @param query - The search query
   * @param options - Optional settings (collection, limit, weights)
   * @returns Recall response with memories, profiles, events, and pre-formatted context
   * 
   * @example
   * ```typescript
   * const results = await db.recall('user preferences', {
   *   limit: 5,
   *   weights: { similarity: 0.6, recency: 0.2, salience: 0.2 }
   * });
   * 
   * // Access structured profiles
   * console.log(results.profiles);
   * 
   * // Access timeline events
   * console.log(results.events);
   * 
   * // Use pre-formatted context for LLM
   * console.log(results.context);
   * ```
   */
  async recall(query: string, options: RecallOptions = {}): Promise<RecallResponse> {
    return this.request<RecallResponse>('POST', '/v1/recall', {
      collection: this.getCollection(options.collection),
      query,
      limit: options.limit || 10,
      weights: options.weights,
      memory_types: options.memoryTypes,
    });
  }


  /**
   * Store a memory without cognitive processing (raw mode).
   * 
   * @param content - The content to store
   * @param options - Optional settings (collection, memoryType, metadata)
   * @returns The ID of the stored memory
   */
  async store(content: string, options: StoreOptions = {}): Promise<StoreResponse> {
    return this.request<StoreResponse>('POST', '/v1/store', {
      collection: this.getCollection(options.collection),
      content,
      memory_type: options.memoryType || 'Conversation',
      metadata: options.metadata || {},
    });
  }

  /**
   * Get a specific memory by ID.
   * 
   * @param id - The memory ID
   * @param collection - Optional collection name
   * @returns The memory object
   */
  async get(id: string, collection?: string): Promise<Memory> {
    return this.request<Memory>(
      'GET',
      `/v1/memory/${this.getCollection(collection)}/${id}`
    );
  }

  /**
   * Delete a memory by ID.
   * 
   * @param id - The memory ID
   * @param collection - Optional collection name
   */
  async delete(id: string, collection?: string): Promise<void> {
    await this.request<{ success: boolean }>(
      'DELETE',
      `/v1/memory/${this.getCollection(collection)}/${id}`
    );
  }

  /**
   * Apply salience decay to memories in a collection.
   * 
   * @param rate - Decay rate (0.0 to 1.0, default: 0.1)
   * @param collection - Optional collection name
   * @returns Number of affected memories
   */
  async decay(rate: number = 0.1, collection?: string): Promise<DecayResponse> {
    return this.request<DecayResponse>('POST', '/v1/decay', {
      collection: this.getCollection(collection),
      rate,
    });
  }

  /**
   * Consolidate similar memories in a collection.
   * 
   * @param threshold - Similarity threshold (0.0 to 1.0, default: 0.8)
   * @param collection - Optional collection name
   * @returns Number of consolidated memory groups
   */
  async consolidate(threshold: number = 0.8, collection?: string): Promise<ConsolidateResponse> {
    return this.request<ConsolidateResponse>('POST', '/v1/consolidate', {
      collection: this.getCollection(collection),
      threshold,
    });
  }

  /**
   * Generate insights from recent memories.
   * 
   * @param windowSize - Number of recent memories to analyze (default: 10)
   * @param collection - Optional collection name
   * @returns Generated reflection/insights
   */
  async reflect(windowSize: number = 10, collection?: string): Promise<ReflectResponse> {
    return this.request<ReflectResponse>('POST', '/v1/reflect', {
      collection: this.getCollection(collection),
      window_size: windowSize,
    });
  }

  /**
   * Get statistics for a collection.
   * 
   * @param collection - Optional collection name
   * @returns Collection statistics including profile and event counts
   */
  async stats(collection?: string): Promise<StatsResponse> {
    return this.request<StatsResponse>('GET', '/v1/stats', undefined, {
      collection: this.getCollection(collection),
    });
  }

  /**
   * Get knowledge graph for a collection.
   * 
   * @param collection - Optional collection name
   * @returns Graph with nodes and edges
   */
  async graph(collection?: string): Promise<GraphResponse> {
    return this.request<GraphResponse>('GET', '/v1/graph', undefined, {
      collection: this.getCollection(collection),
    });
  }

  /**
   * Purge all memories in a collection.
   * 
   * @param collection - Optional collection name
   * @returns Number of deleted memories
   */
  async purge(collection?: string): Promise<PurgeResponse> {
    return this.request<PurgeResponse>('DELETE', '/v1/purge', undefined, {
      collection: this.getCollection(collection),
    });
  }

  /**
   * Check server health.
   * 
   * @returns Health status and version
   */
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('GET', '/v1/health');
  }
}

// Legacy alias for backward compatibility
export const CognitiveDB = DeltaMemory;
