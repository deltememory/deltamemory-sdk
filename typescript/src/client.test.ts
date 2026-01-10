/**
 * DeltaMemory TypeScript SDK Tests
 * 
 * These tests require a running DeltaMemory server at http://localhost:6969
 * Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DeltaMemory } from './client';
import { 
  DeltaMemoryError, 
  MemoryNotFoundError,
  ConnectionError 
} from './errors';

// Test collection name (unique per test run)
const TEST_COLLECTION = `test-${Date.now()}`;

describe('DeltaMemory Client', () => {
  let db: DeltaMemory;

  beforeAll(() => {
    db = new DeltaMemory({
      baseUrl: process.env.DELTAMEMORY_URL || 'http://localhost:6969',
      defaultCollection: TEST_COLLECTION,
    });
  });

  afterAll(async () => {
    // Clean up test collection
    try {
      await db.purge(TEST_COLLECTION);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('health', () => {
    it('should return health status', async () => {
      const health = await db.health();
      expect(health.healthy).toBe(true);
      expect(health.version).toBeDefined();
    });
  });

  describe('store and get', () => {
    it('should store and retrieve a memory', async () => {
      const content = 'Test memory content';
      const { id } = await db.store(content);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const memory = await db.get(id);
      expect(memory.content).toBe(content);
      expect(memory.collection).toBe(TEST_COLLECTION);
    });

    it('should store with metadata', async () => {
      const content = 'Memory with metadata';
      const metadata = { source: 'test', priority: 'high' };
      
      const { id } = await db.store(content, { metadata });
      const memory = await db.get(id);
      
      expect(memory.metadata).toEqual(metadata);
    });

    it('should store with memory type', async () => {
      const { id } = await db.store('A fact', { memoryType: 'Fact' });
      const memory = await db.get(id);
      
      expect(memory.memory_type).toBe('Fact');
    });
  });

  describe('delete', () => {
    it('should delete a memory', async () => {
      const { id } = await db.store('To be deleted');
      
      await db.get(id);
      await db.delete(id);
      
      await expect(db.get(id)).rejects.toThrow(MemoryNotFoundError);
    });

    it('should throw MemoryNotFoundError for non-existent memory', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(db.delete(fakeId)).rejects.toThrow(MemoryNotFoundError);
    });
  });

  describe('ingest', () => {
    it('should ingest content with cognitive processing', async () => {
      const result = await db.ingest('I prefer TypeScript over JavaScript for type safety');
      
      expect(result.memory_ids).toBeDefined();
      expect(result.memory_ids.length).toBeGreaterThan(0);
      expect(Array.isArray(result.facts)).toBe(true);
      expect(Array.isArray(result.concepts)).toBe(true);
    });

    it('should ingest with metadata and datetime', async () => {
      const result = await db.ingest('Test content', {
        metadata: { source: 'test' },
        datetime: '2024-01-15T10:30:00Z',
        speaker: 'user'
      });
      
      expect(result.memory_ids.length).toBeGreaterThan(0);
    });
  });

  describe('recall', () => {
    it('should recall memories with profiles and events', async () => {
      await db.ingest('The user likes coffee in the morning');
      
      const result = await db.recall('coffee preferences');
      
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      // New fields from UPGRADE.md
      expect(Array.isArray(result.profiles) || result.profiles === undefined).toBe(true);
      expect(Array.isArray(result.events) || result.events === undefined).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const result = await db.recall('test', { limit: 2 });
      expect(result.results.length).toBeLessThanOrEqual(2);
    });

    it('should accept custom weights', async () => {
      const result = await db.recall('test', {
        weights: {
          similarity: 0.7,
          recency: 0.2,
          salience: 0.1,
        }
      });
      
      expect(result.results).toBeDefined();
    });

    it('should filter by memory types', async () => {
      const result = await db.recall('test', {
        memoryTypes: ['Fact', 'Insight']
      });
      
      expect(result.results).toBeDefined();
    });
  });

  describe('stats', () => {
    it('should return collection statistics with profile and event counts', async () => {
      const stats = await db.stats();
      
      expect(typeof stats.memory_count).toBe('number');
      expect(typeof stats.fact_count).toBe('number');
      expect(typeof stats.concept_count).toBe('number');
      expect(typeof stats.relation_count).toBe('number');
      expect(typeof stats.vector_count).toBe('number');
      expect(typeof stats.profile_count).toBe('number');
      expect(typeof stats.event_count).toBe('number');
    });
  });

  describe('decay', () => {
    it('should apply salience decay', async () => {
      const result = await db.decay(0.1);
      expect(typeof result.affected_count).toBe('number');
    });
  });

  describe('graph', () => {
    it('should return knowledge graph', async () => {
      const graph = await db.graph();
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
    });
  });

  describe('purge', () => {
    it('should purge all memories in collection', async () => {
      const purgeCollection = `purge-test-${Date.now()}`;
      const purgeDb = new DeltaMemory({
        baseUrl: process.env.DELTAMEMORY_URL || 'http://localhost:6969',
        defaultCollection: purgeCollection,
      });

      await purgeDb.store('Memory 1');
      await purgeDb.store('Memory 2');

      const statsBefore = await purgeDb.stats();
      expect(statsBefore.memory_count).toBeGreaterThan(0);

      const result = await purgeDb.purge();
      expect(result.deleted_count).toBeGreaterThan(0);

      const statsAfter = await purgeDb.stats();
      expect(statsAfter.memory_count).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should throw ConnectionError for invalid URL', async () => {
      const badDb = new DeltaMemory({
        baseUrl: 'http://localhost:99999',
        timeout: 1000,
      });

      await expect(badDb.health()).rejects.toThrow(ConnectionError);
    });

    it('should throw MemoryNotFoundError for non-existent memory', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(db.get(fakeId)).rejects.toThrow(MemoryNotFoundError);
    });
  });
});

describe('DeltaMemory Configuration', () => {
  it('should use default values', () => {
    const db = new DeltaMemory();
    expect(db).toBeDefined();
  });

  it('should accept custom configuration', () => {
    const db = new DeltaMemory({
      baseUrl: 'http://custom:8080',
      defaultCollection: 'custom-collection',
      timeout: 5000,
      headers: { 'X-Custom': 'header' },
    });
    expect(db).toBeDefined();
  });
});
