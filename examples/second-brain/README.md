# Second Brain - Voice Memory Assistant

A voice-powered personal knowledge management system using Azure OpenAI GPT Realtime API (WebRTC) and DeltaMemory for persistent memory.

## Features

- **🎤 Voice Interaction**: Real-time speech-to-speech via WebRTC (low latency)
- **🧠 Persistent Memory**: Everything you tell it is remembered using DeltaMemory
- **👥 Multi-user Support**: Switch between users with separate memory stores
- **🔍 Semantic Search**: Ask about anything you've mentioned before
- **📊 Memory Stats**: See extracted facts, concepts, and relationships

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials

# Start the app
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Azure OpenAI Setup

1. Create an Azure OpenAI resource in East US 2 or Sweden Central
2. Deploy a `gpt-realtime` model (gpt-4o-realtime-preview or gpt-realtime)
3. Copy your endpoint and API key to `.env`

## Usage

1. Select a user from the dropdown
2. Click "Start Conversation" to begin
3. Speak naturally - the AI will:
   - Automatically save important information you share
   - Recall relevant memories when you ask questions
   - Make connections between different pieces of information

### Example Interactions

**Saving memories:**
- "Remember that I prefer TypeScript over JavaScript"
- "I had a great idea today - we should add voice search to the app"
- "Note to self: follow up with Sarah about the project deadline"

**Recalling memories:**
- "What do I know about TypeScript?"
- "What ideas have I had recently?"
- "What did I say about Sarah?"

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── realtime/token/  # Ephemeral token generation
│   │   ├── memory/          # DeltaMemory operations
│   │   └── stats/           # Memory statistics
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── voice-interface.tsx  # WebRTC + audio handling
│   ├── transcript.tsx       # Conversation display
│   ├── tool-activity.tsx    # Memory tool calls
│   ├── stats-panel.tsx
│   └── user-selector.tsx
└── lib/
    ├── memory-tools.ts
    └── users.ts
```

## How It Works

1. **Token Service**: Server generates ephemeral token with session config
2. **WebRTC Connection**: Browser connects directly to Azure OpenAI via WebRTC
3. **Audio Streaming**: Microphone audio streams with low latency
4. **Tool Calling**: Model calls memory tools (save/recall) as needed
5. **Memory Operations**: Tools interact with DeltaMemory for persistence

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Deployment name (default: gpt-realtime) |
| `DELTAMEMORY_API_KEY` | Your DeltaMemory API key |
| `DELTAMEMORY_URL` | Your DeltaMemory instance URL |

## Tech Stack

- **Next.js 16** with App Router
- **Azure OpenAI GPT Realtime API** via WebRTC
- **DeltaMemory** for cognitive memory storage
- **Tailwind CSS** for styling
- **Bun** as the runtime
