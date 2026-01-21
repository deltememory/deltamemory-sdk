# Hello World Example

The simplest possible DeltaMemory example - ingest and recall in under 20 lines.

## Quick Start

### TypeScript

```bash
npm install
npm run dev
```

### Python

```bash
pip install deltamemory
python hello.py
```

## What It Does

1. Ingests a simple preference statement
2. Recalls it with a query
3. Shows the cognitive score
4. Displays extracted user profile

## Expected Output

```
Storing memory...
Recalling memory...

=== Memories ===
[0.92] I love TypeScript and building AI applications

=== User Profile ===
interests::language: TypeScript
interests::activity: building AI applications
```

## Environment Variables

```bash
export DELTAMEMORY_API_KEY=dm_your_api_key_here
export DELTAMEMORY_URL=https://api-us-east-1.deltamemory.com
```

Get your credentials from [app.deltamemory.com](https://app.deltamemory.com)

## Next Steps

- Try changing the content and query
- Experiment with different recall weights
- Add more memories and see how recall works
- Check out the [chatbot example](../chatbot) for a more complete application
