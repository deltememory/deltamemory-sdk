# Learning Tutor

Multi-agent AI tutor demonstrating DeltaMemory's shared memory capabilities. Two specialized agents collaborate through persistent memory to provide personalized learning experiences.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   TutorAgent    │     │  PracticeAgent  │
│  (Explains)     │     │  (Exercises)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │ DeltaMemory │
              │  (Shared)   │
              └─────────────┘
```

**TutorAgent** - Explains concepts, adapts to learning style, assesses understanding  
**PracticeAgent** - Creates exercises, tracks progress, adjusts difficulty  
**Shared Memory** - Both agents read/write to the same memory, enabling seamless handoffs

## Demo Flow

1. Select a student profile
2. Ask TutorAgent to explain a concept (e.g., "Teach me about recursion")
3. Watch the agent recall past context, explain, and store new insights
4. Switch to PracticeAgent and request exercises
5. PracticeAgent recalls what TutorAgent stored and creates appropriate exercises
6. Knowledge graph visualizes the learning journey

## Tools

| Tool | Type | Description |
|------|------|-------------|
| `recallMemory` | DeltaMemory | Search past learning context |
| `storeMemory` | DeltaMemory | Save insights and progress |
| `assessUnderstanding` | Mock | Evaluate student responses |
| `trackProgress` | Mock | Record exercise results |
| `generateExercise` | Mock | Create practice problems |

## Setup

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Add your keys to .env

# Run development server
bun dev
```

## Environment Variables

```
DELTAMEMORY_API_KEY=dm_your_api_key
DELTAMEMORY_URL=https://your-endpoint.deltamemory.com
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## Test Conversations

**Session 1 - TutorAgent:**
- "I want to learn Python, I'm a complete beginner"
- "Can you explain what variables are?"
- "I'm confused about the difference between lists and tuples"

**Session 2 - PracticeAgent:**
- "Give me some practice exercises"
- "That was too easy, give me something harder"
- "I got it wrong, can you explain?"

**Session 3 - Back to TutorAgent:**
- "What have I learned so far?"
- "What should I focus on next?"

Watch how both agents reference the same memories and build on each other's work.

## Tech Stack

- Next.js 15 + App Router
- AI SDK 6 (Vercel)
- DeltaMemory SDK
- Gemini 2.0 Flash
- D3.js (Knowledge Graph)
- Tailwind CSS
