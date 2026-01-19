/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/// <reference types="vite/client" />

import { DeltaMemory } from 'deltamemory';

const DELTAMEMORY_URL = import.meta.env.VITE_DELTAMEMORY_URL || 'http://localhost:6969';
const DELTAMEMORY_API_KEY = import.meta.env.VITE_DELTAMEMORY_API_KEY;

// Singleton DeltaMemory client
let deltaMemoryClient: DeltaMemory | null = null;

// Stats callback - set by the app
let onRecall: ((timeMs: number, resultCount: number) => void) | null = null;
let onIngest: ((timeMs: number) => void) | null = null;

export function setStatsCallbacks(
  recallCb: (timeMs: number, resultCount: number) => void,
  ingestCb: (timeMs: number) => void
) {
  onRecall = recallCb;
  onIngest = ingestCb;
}

export function getDeltaMemory(): DeltaMemory {
  if (!deltaMemoryClient) {
    deltaMemoryClient = new DeltaMemory({
      baseUrl: DELTAMEMORY_URL,
      apiKey: DELTAMEMORY_API_KEY,
    });
  }
  return deltaMemoryClient;
}

/**
 * Save information to memory for a specific user
 */
export async function saveToMemory(userId: string, content: string): Promise<{ success: boolean; message: string }> {
  const startTime = performance.now();
  try {
    const db = getDeltaMemory();
    const result = await db.ingest(content, {
      collection: `customer-${userId}`,
      speaker: 'customer',
      datetime: new Date().toISOString(),
    });
    
    const elapsed = Math.round(performance.now() - startTime);
    onIngest?.(elapsed);
    
    return {
      success: true,
      message: `Saved to memory in ${elapsed}ms. Extracted ${result.facts.length} facts and ${result.concepts.length} concepts.`,
    };
  } catch (error) {
    console.error('Error saving to memory:', error);
    return {
      success: false,
      message: `Failed to save to memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Recall relevant memories for a specific user
 */
export async function recallMemory(userId: string, query: string): Promise<{ success: boolean; context: string; memories: string[] }> {
  const startTime = performance.now();
  try {
    const db = getDeltaMemory();
    const result = await db.recall(query, {
      collection: `customer-${userId}`,
      limit: 5,
    });
    
    const elapsed = Math.round(performance.now() - startTime);
    onRecall?.(elapsed, result.results.length);
    
    const memories = result.results.map(r => r.memory.content);
    const context = result.context || memories.join('\n\n');
    
    return {
      success: true,
      context,
      memories,
    };
  } catch (error) {
    console.error('Error recalling memory:', error);
    return {
      success: false,
      context: 'No previous memories found for this customer.',
      memories: [],
    };
  }
}
