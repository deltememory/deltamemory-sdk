# @deltamemory/ai-sdk

DeltaMemory integration for Vercel AI SDK. Provides memory tools that AI agents can use to recall past context and store important information.

## Installation

```bash
npm install @deltamemory/ai-sdk deltamemory
# or
yarn add @deltamemory/ai-sdk deltamemory
# or
pnpm add @deltamemory/ai-sdk deltamemory
```

## Quick Start

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deltaMemoryTools } from '@deltamemory/ai-sdk';
import { DeltaMemory } from 'deltamemory';

const client = new DeltaMemory({
  apiKey: 'dm_your_api_key_here',  // Required for authentication
  baseUrl: 'http://localhost:6969'
});

const { text } = await generateText({
  model: openai('gpt-4'),
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant with memory. Use memory tools to recall context and store important information.'
    },
    {
      role: 'user',
      content: 'What are my preferences?'
    }
  ],
  tools: {
    ...deltaMemoryTools(client, { userId: 'user-123' })
  },
  maxToolRoundtrips: 5
});

console.log(text);
```

## API

### deltaMemoryTools(client, config)

Creates memory tools for Vercel AI SDK.

**Parameters:**

- `client: DeltaMemory` - DeltaMemory client instance
- `config: DeltaMemoryToolsConfig` - Configuration object
  - `userId: string` - User identifier for memory isolation (required)
  - `collection?: string` - Optional collection name
  - `metadata?: Record<string, string>` - Optional metadata for all operations

**Returns:** Object with `recallMemory` and `storeMemory` tools

## Tools

### recallMemory

Search past conversations and user context.

**When to use:**
- User references past events
- User asks about preferences or history
- Context would improve the response

**Parameters:**
- `query: string` - What to search for
- `limit?: number` - Max results (default: 5)

**Returns:**
- `profiles` - Structured user facts
- `events` - Timeline entries
- `context` - Pre-formatted context string
- `memoryCount` - Number of memories found

### storeMemory

Store important information for future reference.

**When to use:**
- User shares preferences
- User asks to remember something
- Important facts emerge

**Parameters:**
- `content: string` - Information to remember
- `importance?: 'low' | 'medium' | 'high'` - Importance level

**Returns:**
- `memoryIds` - IDs of stored memories
- `extractedFacts` - Automatically extracted facts
- `extractedConcepts` - Automatically extracted concepts

## Examples

### Basic Chat

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deltaMemoryTools } from '@deltamemory/ai-sdk';
import { DeltaMemory } from 'deltamemory';

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY
});

async function chat(userId: string, message: string) {
  const { text } = await generateText({
    model: openai('gpt-4'),
    messages: [{ role: 'user', content: message }],
    tools: {
      ...deltaMemoryTools(client, { userId })
    }
  });
  return text;
}

// First message - stores preference
await chat('user-123', 'I prefer TypeScript over JavaScript');

// Second message - recalls preference
await chat('user-123', 'What programming language should I use?');
```

### Streaming

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { deltaMemoryTools } from '@deltamemory/ai-sdk';
import { DeltaMemory } from 'deltamemory';

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY
});

async function chatStream(userId: string, message: string) {
  const { textStream } = await streamText({
    model: openai('gpt-4'),
    messages: [{ role: 'user', content: message }],
    tools: {
      ...deltaMemoryTools(client, { userId })
    }
  });

  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }
}
```

### Multi-User

```typescript
import { deltaMemoryTools } from '@deltamemory/ai-sdk';
import { DeltaMemory } from 'deltamemory';

const client = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY
});

async function chat(userId: string, message: string) {
  const { text } = await generateText({
    model: openai('gpt-4'),
    messages: [{ role: 'user', content: message }],
    tools: {
      ...deltaMemoryTools(client, {
        userId,
        collectionPrefix: 'myapp',  // Collection: 'myapp-user-123'
        metadata: { source: 'chat' }
      })
    }
  });
  return text;
}
```

## Documentation

For complete documentation, visit [deltamemory.ai/docs](https://deltamemory.ai/docs)

## License

Proprietary - See LICENSE file
