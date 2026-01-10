# DeltaMemory Python SDK

## Features

- **Cognitive Processing**: Automatic fact, concept, profile, and event extraction
- **Hybrid Search**: Combines semantic similarity, recency, and salience scoring
- **User Profiles**: Structured facts organized by topic (basic_info, work, interests, etc.)
- **Event Timeline**: Track activities, plans, milestones, and preferences with timestamps
- **Knowledge Graph**: Multi-hop reasoning across concepts and relationships
- **Pre-formatted Context**: Ready-to-use context strings for LLM consumption
- **Async/Await**: Full async support with httpx

## Installation

```bash
pip install deltamemory
# or
poetry add deltamemory
# or
uv add deltamemory
```

## Quick Start

```python
import asyncio
from deltamemory import DeltaMemory, IngestOptions, RecallOptions, RecallWeights

async def main():
    # Create client with API key
    db = DeltaMemory(
        api_key='dm_your_api_key_here',  # Required for authentication
        base_url='http://localhost:6969',
        default_collection='my-app'
    )

    async with db:
        # Ingest content with cognitive processing
        result = await db.ingest(
            'User prefers dark mode and TypeScript',
            IngestOptions(
                datetime='2024-01-15T10:30:00Z',
                speaker='user'
            )
        )
        print('Extracted facts:', result.facts)
        print('Extracted concepts:', result.concepts)

        # Recall relevant memories with profiles and events
        recall = await db.recall('What are the user preferences?')

        # Access structured user profiles
        print('Profiles:', recall.profiles)
        # [UserProfile(topic='interest', sub_topic='language', content='TypeScript')]

        # Access timeline events
        print('Events:', recall.events)
        # [UserEvent(gist='prefers dark mode', event_type='preference')]

        # Use pre-formatted context for LLM
        print('Context:', recall.context)

asyncio.run(main())
```

## Authentication

DeltaMemory requires an API key for all requests. Get your key by running:

```bash
deltamemory setup
```

Then use it in your client:

```python
import os
from deltamemory import DeltaMemory

# Direct configuration
db = DeltaMemory(api_key='dm_your_api_key_here')

# Or from environment variable
db = DeltaMemory(api_key=os.environ.get('DELTAMEMORY_API_KEY'))
```

## API Reference

### Constructor

```python
db = DeltaMemory(
    api_key='dm_your_api_key',           # Required for authentication
    base_url='http://localhost:6969',    # Default
    default_collection='default',         # Default
    timeout=30.0,                          # Default (seconds)
    headers={'X-Custom': 'header'},        # Optional
)

# Or from config
from deltamemory import DeltaMemoryConfig
config = DeltaMemoryConfig(
    api_key='dm_your_api_key',
    base_url='http://localhost:6969'
)
db = DeltaMemory.from_config(config)
```

### Methods

#### `ingest(content, options?)`

Ingest content with full cognitive processing.

```python
from deltamemory import IngestOptions

result = await db.ingest(
    'I started learning TypeScript last week',
    IngestOptions(
        collection='preferences',
        metadata={'source': 'chat'},
        datetime='2024-01-15T10:30:00Z',
        speaker='user'
    )
)
# Returns: IngestResponse(memory_ids, facts, concepts)
```

#### `recall(query, options?)`

Recall memories with profiles, events, and pre-formatted context.

```python
from deltamemory import RecallOptions, RecallWeights, MemoryType

result = await db.recall(
    'user preferences',
    RecallOptions(
        limit=10,
        weights=RecallWeights(similarity=0.5, recency=0.3, salience=0.2),
        memory_types=[MemoryType.FACT, MemoryType.INSIGHT]
    )
)

# Access results
print(result.results)      # List[MemoryResult]
print(result.concepts)     # List[ConceptResult]
print(result.profiles)     # List[UserProfile]
print(result.events)       # List[UserEvent]
print(result.context)      # str - Pre-formatted for LLM
```

#### `store(content, options?)`

Store a memory without cognitive processing.

```python
from deltamemory import StoreOptions, MemoryType

response = await db.store(
    'Important fact',
    StoreOptions(
        memory_type=MemoryType.FACT,
        metadata={'importance': 'high'}
    )
)
print(response.id)
```

#### `get(id, collection?)`

Get a specific memory by ID.

```python
memory = await db.get('memory-id')
```

#### `delete(id, collection?)`

Delete a memory by ID.

```python
await db.delete('memory-id')
```

#### `decay(rate?, collection?)`

Apply salience decay to memories.

```python
result = await db.decay(rate=0.1)
print(result.affected_count)
```

#### `consolidate(threshold?, collection?)`

Consolidate similar memories using LLM.

```python
result = await db.consolidate(threshold=0.8)
print(result.consolidated_count)
```

#### `reflect(window_size?, collection?)`

Generate insights from recent memories.

```python
result = await db.reflect(window_size=10)
print(result.reflection)
```

#### `stats(collection?)`

Get collection statistics.

```python
stats = await db.stats()
print(stats.memory_count)
print(stats.profile_count)
print(stats.event_count)
```

#### `graph(collection?)`

Get knowledge graph for visualization.

```python
graph = await db.graph()
print(graph.nodes)
print(graph.edges)
```

#### `purge(collection?)`

Delete all memories in a collection.

```python
result = await db.purge()
print(result.deleted_count)
```

#### `health()`

Check server health.

```python
health = await db.health()
print(health.healthy, health.version)
```

## Types

```python
from deltamemory import (
    MemoryType,      # Enum: CONVERSATION, FACT, INSIGHT, SUMMARY
    RecallWeights,   # similarity, recency, salience weights
    Memory,          # Memory object
    MemoryResult,    # Memory with cognitive scores
    UserProfile,     # Structured user fact
    UserEvent,       # Timeline entry
    RecallResponse,  # Full recall response
    StatsResponse,   # Collection statistics
    GraphNode,       # Knowledge graph node
    GraphEdge,       # Knowledge graph edge
)
```

## Error Handling

```python
from deltamemory import (
    DeltaMemoryError,
    MemoryNotFoundError,
    CollectionNotFoundError,
    InvalidRequestError,
    ServerUnavailableError,
    ConnectionError,
)

try:
    await db.get('non-existent-id')
except MemoryNotFoundError:
    print('Memory not found')
except ConnectionError:
    print('Server unavailable')
except DeltaMemoryError as e:
    print(f'Error: {e.message} (code: {e.code})')
```

## Context Manager

The client supports async context manager for automatic cleanup:

```python
async with DeltaMemory() as db:
    await db.ingest('Hello world')
    # Client is automatically closed when exiting the context
```

## Migration from CognitiveDB

If you're migrating from the old `cognitivedb` package:

```python
# Old
from cognitivedb import CognitiveDB
db = CognitiveDB(...)

# New
from deltamemory import DeltaMemory
db = DeltaMemory(...)

# Or use the legacy alias for gradual migration
from deltamemory import CognitiveDB
db = CognitiveDB(...)
```

## License

Apache-2.0
