# Legal Assistant with DeltaMemory

AI-powered legal research assistant that remembers case details, contracts, depositions, and client communications.

## Features

- **📤 PDF Upload**: Upload any legal document (contracts, briefs, depositions)
- **⚡ Real-time Progress**: Watch as documents are parsed and indexed
- **🔍 Semantic Search**: Ask natural language questions about your documents
- **🧠 Multi-hop Reasoning**: Connect facts across multiple documents
- **📊 Memory Stats**: See extracted facts, concepts, and relationships

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - DELTAMEMORY_API_KEY
# - DELTAMEMORY_URL
# - GOOGLE_GENERATIVE_AI_API_KEY

# Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Option 1: Demo Case
Click "Demo Case" to explore a pre-loaded breach of contract case (TechFlow v. DataSync) with:
- Master Services Agreement
- Email communications
- Deposition transcripts
- Meeting notes
- Damages calculation

### Option 2: Upload Your Own Documents
1. Click "Upload Documents"
2. Enter a session name (e.g., "Smith v. Jones Review")
3. Drag & drop or click to upload a PDF
4. Watch the progress as the document is parsed and indexed
5. Start asking questions!

## Sample Questions

**For contracts:**
- "What are the key terms of this agreement?"
- "When does the contract expire?"
- "What are the termination provisions?"
- "Who are the parties to this agreement?"

**For depositions:**
- "What did the witness say about the meeting?"
- "Find any contradictions in the testimony"
- "When did the witness first learn about X?"

**For case analysis:**
- "Build a timeline of events"
- "What damages are being claimed?"
- "Summarize the key facts"

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # Demo case chat
│   │   ├── session-chat/   # Uploaded docs chat
│   │   ├── upload/         # PDF upload & parsing
│   │   ├── stats/          # Demo case stats
│   │   └── session-stats/  # Session stats
│   ├── page.tsx            # Main UI
│   └── globals.css
├── components/
│   ├── chat.tsx            # Demo chat interface
│   ├── session-chat.tsx    # Session chat interface
│   ├── pdf-upload.tsx      # PDF upload with progress
│   ├── new-session.tsx     # New session wizard
│   └── ...
└── lib/
    ├── cases.ts            # Demo case definitions
    ├── case-data.ts        # Synthetic case data
    ├── sessions.ts         # Session types
    └── seed.ts             # Seed demo data
```

## How It Works

1. **PDF Parsing**: Documents are parsed using `unpdf` to extract text
2. **Chunking**: Text is split into ~2000 character chunks (by paragraph)
3. **Ingestion**: Each chunk is sent to DeltaMemory for cognitive extraction
4. **Extraction**: DeltaMemory extracts facts, concepts, events, and relationships
5. **Query**: When you ask a question, relevant memories are recalled and used to generate an answer

## Demo Case: TechFlow v. DataSync

A synthetic breach of contract case demonstrating:
- Contract analysis (MSA with specific clauses)
- Email thread analysis (escalation pattern)
- Deposition comparison (finding contradictions)
- Timeline building (chronological events)
- Damages calculation ($10.9M claimed)

To seed the demo case manually:
```bash
npm run seed
```
