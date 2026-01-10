/**
 * DeltaMemory TypeScript SDK Types
 */

/** Memory type enum */
export type MemoryType = 'Conversation' | 'Fact' | 'Insight' | 'Summary';

/** Weights for recall scoring */
export interface RecallWeights {
  similarity?: number;
  recency?: number;
  salience?: number;
}

/** Metadata key-value pairs */
export type Metadata = Record<string, string>;

/** Memory object returned from API */
export interface Memory {
  id: string;
  collection: string;
  content: string;
  memory_type: string;
  salience: number;
  timestamp: number;
  metadata?: Metadata;
}

/** Memory result with cognitive scores */
export interface MemoryResult {
  memory: Memory;
  similarity: number;
  recency: number;
  salience: number;
  cognitive_score: number;
}

/** Extracted fact from content */
export interface ExtractedFact {
  fact: string;
  confidence: number;
}

/** Extracted concept from content */
export interface ExtractedConcept {
  name: string;
  type: string;
  importance: number;
}

/** Ingest response */
export interface IngestResponse {
  memory_ids: string[];
  facts: ExtractedFact[];
  concepts: ExtractedConcept[];
}


/** Concept relation in recall response */
export interface ConceptRelation {
  target_name: string;
  relation_type: string;
  weight: number;
}

/** Concept result in recall response */
export interface ConceptResult {
  id: string;
  name: string;
  concept_type?: string;
  relevance: number;
  relations: ConceptRelation[];
}

/** Knowledge derived from graph traversal (multi-hop) */
export interface GraphKnowledge {
  /** The path through the graph (e.g., "hotel -[has]-> check-in time -[is]-> 2:00 PM") */
  path: string;
  /** Natural language representation of the knowledge */
  statement: string;
  /** Confidence score based on edge weights */
  confidence: number;
  /** Number of hops in the path */
  hops: number;
  /** Source concept that matched the query */
  source_concept: string;
}

/** User profile (structured fact about the user) */
export interface UserProfile {
  id: string;
  topic: string;
  sub_topic: string;
  content: string;
  confidence: number;
  updated_at: number;
}

/** User event (timeline entry) */
export interface UserEvent {
  id: string;
  gist: string;
  event_type: string;
  mentioned_at: number;
  event_at?: number;
  tags: string[];
}

/** Recall response */
export interface RecallResponse {
  results: MemoryResult[];
  concepts: ConceptResult[];
  /** Graph-derived knowledge paths (multi-hop traversal results) */
  graph_knowledge?: GraphKnowledge[];
  /** User profiles (structured facts) */
  profiles?: UserProfile[];
  /** User events (timeline) */
  events?: UserEvent[];
  /** Pre-formatted context string for LLM consumption */
  context?: string;
}

/** Store response */
export interface StoreResponse {
  id: string;
}

/** Decay response */
export interface DecayResponse {
  affected_count: number;
}

/** Consolidate response */
export interface ConsolidateResponse {
  consolidated_count: number;
}

/** Reflect response */
export interface ReflectResponse {
  reflection: string;
}

/** Collection statistics */
export interface StatsResponse {
  memory_count: number;
  fact_count: number;
  concept_count: number;
  relation_count: number;
  vector_count: number;
  profile_count: number;
  event_count: number;
}

/** Purge response */
export interface PurgeResponse {
  deleted_count: number;
}

/** Graph node (concept or fact) */
export interface GraphNode {
  id: string;
  name: string;
  node_type: 'concept' | 'fact';
  concept_type?: string;
  salience?: number;
}

/** Graph edge (relationship) */
export interface GraphEdge {
  from: string;
  to: string;
  relation_type: string;
  weight: number;
}

/** Knowledge graph response */
export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Health check response */
export interface HealthResponse {
  healthy: boolean;
  version: string;
}

/** Error response from API */
export interface ErrorResponse {
  error: string;
  code: string;
}

/** Client configuration options */
export interface DeltaMemoryConfig {
  /** Base URL of the DeltaMemory server (default: http://localhost:6969) */
  baseUrl?: string;
  /** API key for authentication (required unless auth is disabled on server) */
  apiKey?: string;
  /** Default collection to use for operations */
  defaultCollection?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in requests */
  headers?: Record<string, string>;
}

/** Ingest options */
export interface IngestOptions {
  collection?: string;
  metadata?: Metadata;
  /** Timestamp when this content was created (ISO 8601 format) */
  datetime?: string;
  /** Speaker identifier for conversation content */
  speaker?: string;
}

/** Recall options */
export interface RecallOptions {
  collection?: string;
  limit?: number;
  weights?: RecallWeights;
  /** Filter by memory types (e.g., ['Fact', 'Insight']) */
  memoryTypes?: MemoryType[];
}

/** Store options */
export interface StoreOptions {
  collection?: string;
  memoryType?: MemoryType;
  metadata?: Metadata;
}

// Legacy alias for backward compatibility
export type CognitiveDBConfig = DeltaMemoryConfig;
