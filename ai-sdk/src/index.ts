/**
 * @deltamemory/ai-sdk
 * 
 * DeltaMemory integration for Vercel AI SDK
 */

export { deltaMemoryTools, recallMemoryTool, storeMemoryTool } from './tools';
export type { DeltaMemoryToolsConfig } from './tools';

// Re-export DeltaMemory client and common types for convenience
export { DeltaMemory, ConnectionError, DeltaMemoryError } from 'deltamemory';
export type { DeltaMemoryConfig } from 'deltamemory';
