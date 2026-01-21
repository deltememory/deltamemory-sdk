# Changelog

All notable changes to the DeltaMemory SDKs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation improvements
- Troubleshooting guide
- Production deployment guide
- Feature comparison table across SDKs

## TypeScript SDK

### [1.0.0] - 2024-01-15

#### Added
- User profiles with structured facts (basic_info, work, interests, etc.)
- Event timeline tracking (activities, plans, milestones, preferences)
- Pre-formatted context strings for LLM consumption
- `profiles` and `events` in recall responses
- `context` field with ready-to-use LLM context
- Enhanced stats with `profile_count` and `event_count`

#### Changed
- Package renamed from `cognitivedb` to `deltamemory`
- Class renamed from `CognitiveDB` to `DeltaMemory`
- Legacy `CognitiveDB` alias maintained for backward compatibility
- Authentication now requires API key from dashboard

#### Migration Guide
```typescript
// Before
import { CognitiveDB } from 'cognitivedb';
const db = new CognitiveDB({ baseUrl: 'http://localhost:6969' });

// After
import { DeltaMemory } from 'deltamemory';
const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL
});

// Or use legacy alias during migration
import { CognitiveDB } from 'deltamemory';
const db = new CognitiveDB({ ... });
```

## Python SDK

### [1.0.0] - 2024-01-15

#### Added
- User profiles with structured facts
- Event timeline tracking
- Pre-formatted context strings for LLM consumption
- `profiles` and `events` in recall responses
- `context` field with ready-to-use LLM context
- Enhanced stats with `profile_count` and `event_count`
- Async context manager support

#### Changed
- Package renamed from `cognitivedb` to `deltamemory`
- Class renamed from `CognitiveDB` to `DeltaMemory`
- Legacy `CognitiveDB` alias maintained for backward compatibility
- Authentication now requires API key from dashboard

#### Migration Guide
```python
# Before
from cognitivedb import CognitiveDB
db = CognitiveDB(base_url='http://localhost:6969')

# After
from deltamemory import DeltaMemory
db = DeltaMemory(
    api_key=os.environ.get('DELTAMEMORY_API_KEY'),
    base_url=os.environ.get('DELTAMEMORY_URL')
)

# Or use legacy alias during migration
from deltamemory import CognitiveDB
db = CognitiveDB(...)
```

## AI SDK Integration

### [1.0.0] - 2024-01-15

#### Added
- Initial release of `@deltamemory/ai-sdk`
- `deltaMemoryTools()` function for Vercel AI SDK integration
- `recallMemory` tool for searching past context
- `storeMemory` tool for saving important information
- Full TypeScript types and Zod schemas
- Support for streaming responses
- Multi-user memory isolation

## MCP Server

### [1.0.0] - 2024-01-15

#### Added
- Initial release of DeltaMemory MCP server
- `recall_memory` tool for Claude Desktop and other MCP clients
- `store_memory` tool for saving information
- `get_user_profile` tool for accessing structured user facts
- `get_user_events` tool for accessing timeline
- Configuration support for API key and endpoint

---

## Deprecation Policy

- **Minor versions**: Deprecated features will show warnings but continue to work
- **Major versions**: Deprecated features may be removed
- **Notice period**: Minimum 3 months warning before removal in major version
- **Migration guides**: Provided for all breaking changes

## Support Policy

- **Latest version**: Full support with bug fixes and features
- **Previous minor**: Security fixes only for 6 months
- **Older versions**: Community support only

## How to Upgrade

### TypeScript
```bash
npm install deltamemory@latest
# or
yarn upgrade deltamemory
# or
pnpm update deltamemory
```

### Python
```bash
pip install --upgrade deltamemory
# or
poetry update deltamemory
# or
uv pip install --upgrade deltamemory
```

### AI SDK
```bash
npm install @deltamemory/ai-sdk@latest
```

## Breaking Changes

Breaking changes will be clearly marked with ⚠️ **BREAKING** in release notes.

## Questions?

- Documentation: https://docs.deltamemory.com
- Support: support@deltamemory.com
- Issues: Contact support for bug reports
