# Customer Support Agent with DeltaMemory

A voice-enabled customer support agent that remembers everything you tell it using DeltaMemory for persistent memory across conversations.

## Features

- **Voice-based interaction** using Google's Gemini Native Audio API
- **Persistent memory** - The agent remembers customer preferences, past issues, and conversation history
- **Multi-user support** - Switch between 3 users (Alex, Rajesh, Tom) with separate memory stores
- **Customer support tools** - Order status, returns, escalation to human support

## Setup

1. Install dependencies:
```bash
bun install
```

2. Configure environment variables in `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key
DELTAMEMORY_API_KEY=your_deltamemory_api_key
DELTAMEMORY_URL=https://your-deltamemory-instance.com
```

3. Run the development server:
```bash
bun run dev
```

## Usage

1. Select a user from the dropdown (Alex, Rajesh, or Tom)
2. Click the connect button to start a voice session
3. Talk to the customer support agent
4. The agent will automatically:
   - Remember important information you share
   - Recall relevant past interactions
   - Provide personalized support based on your history

## Memory Features

The agent uses DeltaMemory to:
- **Save** customer preferences, issues, and feedback
- **Recall** relevant past interactions when needed
- **Maintain separate memory** for each user

Each user has their own memory collection, so switching users gives you a fresh context while preserving each user's history.
