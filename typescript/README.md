# DeltaMemory TypeScript SDK

## Features

- **Cognitive Processing**: Automatic fact, concept, profile, and event extraction
- **Hybrid Search**: Combines semantic similarity, recency, and salience scoring
- **User Profiles**: Structured facts organized by topic (basic_info, work, interests, etc.)
- **Event Timeline**: Track activities, plans, milestones, and preferences with timestamps
- **Knowledge Graph**: Multi-hop reasoning across concepts and relationships
- **Pre-formatted Context**: Ready-to-use context strings for LLM consumption

## Installation

```bash
npm install deltamemory
# or
yarn add deltamemory
# or
pnpm add deltamemory
```

## Quick Start

```typescript
import { DeltaMemory } from 'deltamemory';

// Create client with credentials from dashboard
const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
  defaultCollection: 'my-app'
});

// Ingest content with cognitive processing
const result = await db.ingest('User prefers dark mode and TypeScript', {
  datetime: '2024-01-15T10:30:00Z',
  speaker: 'user'
});
console.log('Extracted facts:', result.facts);
console.log('Extracted concepts:', result.concepts);

// Recall relevant memories with profiles and events
const recall = await db.recall('What are the user preferences?');

// Access structured user profiles
console.log('Profiles:', recall.profiles);
// [{ topic: 'interest', sub_topic: 'language', content: 'TypeScript' }]

// Access timeline events
console.log('Events:', recall.events);
// [{ gist: 'prefers dark mode', event_type: 'preference' }]

// Use pre-formatted context for LLM
console.log('Context:', recall.context);
// "# User Memory\n## User Profile\n- interest::language: TypeScript\n..."
```

## Authentication

Get your API key and endpoint from [app.deltamemory.com](https://app.deltamemory.com):

1. Sign up and create a project
2. Copy your API key and endpoint URL
3. Set environment variables:

```bash
export DELTAMEMORY_API_KEY=dm_your_api_key_here
export DELTAMEMORY_URL=https://api-us-east-1.deltamemory.com
```

Then use in your client:

```typescript
const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL
});
```

## API Reference

### Constructor

```typescript
const db = new DeltaMemory({
  apiKey?: string;           // API key from dashboard (required)
  baseUrl?: string;          // Your endpoint from dashboard
  defaultCollection?: string; // Default: 'default'
  timeout?: number;          // Default: 30000 (ms)
  headers?: Record<string, string>;
});
```

### Methods

#### `ingest(content, options?)`

Ingest content with full cognitive processing.

```typescript
const result = await db.ingest('I started learning TypeScript last week', {
  collection: 'preferences',
  metadata: { source: 'chat' },
  datetime: '2024-01-15T10:30:00Z',
  speaker: 'user'
});
// Returns: { memory_ids, facts, concepts }
// Background: extracts profiles and events automatically
```

#### `recall(query, options?)`

Recall memories with profiles, events, and pre-formatted context.

```typescript
const result = await db.recall('user preferences', {
  limit: 10,
  weights: { similarity: 0.5, recency: 0.3, salience: 0.2 },
  memoryTypes: ['Fact', 'Insight']
});

// Returns:
// {
//   results: MemoryResult[],
//   concepts: ConceptResult[],
//   profiles: UserProfile[],
//   events: UserEvent[],
//   context: string
// }
```


#### `store(content, options?)`

Store a memory without cognitive processing.

```typescript
const { id } = await db.store('Important fact', {
  memoryType: 'Fact',
  metadata: { importance: 'high' }
});
```

#### `get(id, collection?)`

Get a specific memory by ID.

#### `delete(id, collection?)`

Delete a memory by ID.

#### `decay(rate?, collection?)`

Apply salience decay to memories.

#### `consolidate(threshold?, collection?)`

Consolidate similar memories using LLM.

#### `reflect(windowSize?, collection?)`

Generate insights from recent memories.

#### `stats(collection?)`

Get collection statistics.

```typescript
const stats = await db.stats();
// { memory_count, fact_count, concept_count, relation_count, 
//   vector_count, profile_count, event_count }
```

#### `graph(collection?)`

Get knowledge graph for visualization.

#### `purge(collection?)`

Delete all memories in a collection.

#### `health()`

Check server health.

## Types

```typescript
interface UserProfile {
  id: string;
  topic: string;        // 'basic_info', 'work', 'interest', etc.
  sub_topic: string;    // 'name', 'title', 'hobbies', etc.
  content: string;
  confidence: number;
  updated_at: number;
}

interface UserEvent {
  id: string;
  gist: string;
  event_type: string;   // 'activity', 'plan', 'milestone', 'preference', 'social'
  mentioned_at: number;
  event_at?: number;
  tags: string[];
}

interface RecallResponse {
  results: MemoryResult[];
  concepts: ConceptResult[];
  profiles?: UserProfile[];
  events?: UserEvent[];
  context?: string;
}

interface StatsResponse {
  memory_count: number;
  fact_count: number;
  concept_count: number;
  relation_count: number;
  vector_count: number;
  profile_count: number;
  event_count: number;
}

type MemoryType = 'Conversation' | 'Fact' | 'Insight' | 'Summary';
```

## Error Handling

```typescript
import { 
  DeltaMemoryError,
  MemoryNotFoundError,
  ConnectionError 
} from 'deltamemory';

try {
  await db.get('non-existent-id');
} catch (error) {
  if (error instanceof MemoryNotFoundError) {
    console.log('Memory not found');
  } else if (error instanceof ConnectionError) {
    console.log('Server unavailable');
  } else if (error instanceof DeltaMemoryError) {
    console.log(`Error: ${error.message} (${error.code})`);
  }
}
```

## Migration from CognitiveDB

If you're migrating from the old `cognitivedb` package:

```typescript
// Old
import { CognitiveDB } from 'cognitivedb';
const db = new CognitiveDB({ ... });

// New
import { DeltaMemory } from 'deltamemory';
const db = new DeltaMemory({ ... });

// Or use the legacy alias for gradual migration
import { CognitiveDB } from 'deltamemory';
const db = new CognitiveDB({ ... });
```

## License

Apache-2.0
