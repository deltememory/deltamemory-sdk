/**
 * DeltaMemory TypeScript SDK
 * 
 * A TypeScript client for DeltaMemory - Smart memory database for AI agents.
 * 
 * @example
 * ```typescript
 * import { DeltaMemory } from 'deltamemory';
 * 
 * const db = new DeltaMemory({
 *   baseUrl: 'http://localhost:6969',
 *   defaultCollection: 'my-app'
 * });
 * 
 * // Ingest content with cognitive processing
 * await db.ingest('User prefers dark mode');
 * 
 * // Recall relevant memories with profiles and events
 * const results = await db.recall('What are the user preferences?');
 * console.log(results.profiles);  // Structured user facts
 * console.log(results.events);    // Timeline events
 * console.log(results.context);   // Pre-formatted LLM context
 * ```
 * 
 * @packageDocumentation
 */

export { DeltaMemory } from './client';
export * from './types';
export * from './errors';
