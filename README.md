# DeltaMemory

A cognitive memory system for AI applications. DeltaMemory provides intelligent memory management with automatic fact extraction, user profiling, event tracking, and hybrid search capabilities.

## Overview

DeltaMemory enables AI agents and applications to:

- **Ingest** content with automatic cognitive processing (fact/concept extraction, user profiling, event detection)
- **Recall** memories using hybrid search combining semantic similarity, recency, and salience scoring
- **Store** raw memories without processing when needed
- **Build knowledge graphs** with multi-hop reasoning capabilities
- **Track user profiles** with structured facts organized by topic
- **Maintain event timelines** for activities, plans, milestones, and preferences

## SDKs

This repository contains official client SDKs for DeltaMemory:

| Package | Language | Description |
|---------|----------|-------------|
| [`deltamemory`](./typescript) | TypeScript/JavaScript | Full-featured async client |
| [`deltamemory`](./python) | Python | Async client with httpx |
| [`@deltamemory/ai-sdk`](./ai-sdk) | TypeScript | Vercel AI SDK integration |

## Quick Start

### TypeScript

```bash
npm install deltamemory
```

```typescript
import { DeltaMemory } from 'deltamemory';

const db = new DeltaMemory({
  apiKey: 'dm_your_api_key_here',
  defaultCollection: 'my-app'
});

// Ingest with cognitive processing
const result = await db.ingest('User prefers dark mode and TypeScript');
console.log(result.facts);     // Extracted facts
console.log(result.concepts);  // Extracted concepts

// Recall with profiles and events
const recall = await db.recall('user preferences');
console.log(recall.profiles);  // Structured user facts
console.log(recall.events);    // Timeline events
console.log(recall.context);   // Pre-formatted LLM context
```

### Python

```bash
pip install deltamemory
```

```python
from deltamemory import DeltaMemory

async with DeltaMemory(api_key='dm_your_api_key_here') as db:
    # Ingest with cognitive processing
    result = await db.ingest('User prefers dark mode and TypeScript')
    
    # Recall with profiles and events
    recall = await db.recall('user preferences')
    print(recall.context)  # Pre-formatted LLM context
```

### Vercel AI SDK

```bash
npm install @deltamemory/ai-sdk deltamemory
```

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deltaMemoryTools } from '@deltamemory/ai-sdk';
import { DeltaMemory } from 'deltamemory';

const client = new DeltaMemory({ apiKey: process.env.DELTAMEMORY_API_KEY });

const { text } = await generateText({
  model: openai('gpt-4'),
  messages: [{ role: 'user', content: 'What are my preferences?' }],
  tools: {
    ...deltaMemoryTools(client, { userId: 'user-123' })
  }
});
```

## Core Features

### Cognitive Processing

When you ingest content, DeltaMemory automatically:
- Generates embeddings for semantic search
- Extracts facts and concepts using LLM
- Identifies user profile information (interests, preferences, work info)
- Detects events and timeline entries

### Hybrid Search

Recall combines multiple signals:
- **Semantic similarity** - Vector search for meaning
- **Recency** - Temporal relevance
- **Salience** - Importance scoring with decay

### User Profiles

Structured facts organized by topic:
- `basic_info` - Name, location, etc.
- `work` - Job title, company, skills
- `interests` - Hobbies, preferences
- And more...

### Event Timeline

Track user activities with:
- Event types: `activity`, `plan`, `milestone`, `preference`, `social`
- Timestamps for when mentioned and when occurring
- Tags for categorization

### Knowledge Graph

Build and traverse concept relationships:
- Multi-hop reasoning across concepts
- Weighted relationships
- Graph visualization support

## API Methods

| Method | Description |
|--------|-------------|
| `ingest(content, options?)` | Ingest with full cognitive processing |
| `recall(query, options?)` | Hybrid search with profiles/events |
| `store(content, options?)` | Store without cognitive processing |
| `get(id, collection?)` | Get memory by ID |
| `delete(id, collection?)` | Delete memory |
| `decay(rate?, collection?)` | Apply salience decay |
| `consolidate(threshold?, collection?)` | Merge similar memories |
| `reflect(windowSize?, collection?)` | Generate insights |
| `stats(collection?)` | Get collection statistics |
| `graph(collection?)` | Get knowledge graph |
| `purge(collection?)` | Delete all memories |
| `health()` | Check server health |

## Authentication

Get your API key:

```bash
deltamemory setup
```

Use via environment variable or direct configuration:

```typescript
// Environment variable
const db = new DeltaMemory({ apiKey: process.env.DELTAMEMORY_API_KEY });

// Direct configuration
const db = new DeltaMemory({ apiKey: 'dm_your_api_key_here' });
```

## Migration from CognitiveDB

Legacy `CognitiveDB` aliases are available for gradual migration:

```typescript
// Works in both TypeScript and Python
import { CognitiveDB } from 'deltamemory';
const db = new CognitiveDB({ ... });
```

## Documentation

- [TypeScript SDK](./typescript/README.md)
- [Python SDK](./python/README.md)
- [AI SDK Integration](./ai-sdk/README.md)

## License

MIT