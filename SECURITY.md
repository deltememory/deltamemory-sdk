# Security Best Practices

Guidelines for securely using DeltaMemory in your applications.

## API Key Management

### Never Commit API Keys

```bash
# ❌ NEVER do this
const db = new DeltaMemory({
  apiKey: 'dm_abc123...'  // Hardcoded key
});

# ✅ Always use environment variables
const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY
});
```

### Use Secrets Managers

**AWS Secrets Manager:**
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getApiKey() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'deltamemory/api-key' })
  );
  return JSON.parse(response.SecretString).apiKey;
}
```

**Google Secret Manager:**
```python
from google.cloud import secretmanager

def get_api_key():
    client = secretmanager.SecretManagerServiceClient()
    name = "projects/PROJECT_ID/secrets/deltamemory-api-key/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode('UTF-8')
```

**HashiCorp Vault:**
```typescript
import vault from 'node-vault';

const client = vault({ endpoint: 'https://vault.example.com' });
const { data } = await client.read('secret/data/deltamemory');
const apiKey = data.data.apiKey;
```

### API Key Rotation

Implement key rotation without downtime:

```typescript
const primaryKey = process.env.DELTAMEMORY_API_KEY;
const secondaryKey = process.env.DELTAMEMORY_API_KEY_SECONDARY;

async function callWithFallback(fn: () => Promise<any>) {
  try {
    const db = new DeltaMemory({ apiKey: primaryKey });
    return await fn();
  } catch (error) {
    if (error.code === 401 && secondaryKey) {
      const db = new DeltaMemory({ apiKey: secondaryKey });
      return await fn();
    }
    throw error;
  }
}
```

## Data Privacy

### User Data Isolation

Always isolate user data with collections:

```typescript
// ✅ Per-user collections
const db = new DeltaMemory({
  defaultCollection: `user-${userId}`
});

// ❌ Shared collection with all users
const db = new DeltaMemory({
  defaultCollection: 'all-users'  // Privacy risk!
});
```

### Sensitive Information

Never store sensitive data without encryption:

```typescript
// ❌ Don't store raw sensitive data
await db.ingest('My SSN is 123-45-6789');

// ✅ Hash or encrypt first
const hashedSSN = await hash('123-45-6789');
await db.ingest(`User SSN hash: ${hashedSSN}`);
```

### PII Handling

Be mindful of personally identifiable information:

```typescript
// Consider what you're storing
await db.ingest('User email: user@example.com');  // Is this necessary?

// Better: Store only what's needed
await db.ingest('User prefers email notifications');
```

## Network Security

### Always Use HTTPS

```typescript
// ✅ Secure
const db = new DeltaMemory({
  baseUrl: 'https://api-us-east-1.deltamemory.com'
});

// ❌ Insecure (only for local development)
const db = new DeltaMemory({
  baseUrl: 'http://localhost:6969'
});
```

### Verify SSL Certificates

Don't disable SSL verification in production:

```typescript
// ❌ NEVER do this in production
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

## Input Validation

### Sanitize User Input

```typescript
function sanitizeInput(input: string): string {
  // Remove control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

const userMessage = sanitizeInput(req.body.message);
await db.ingest(userMessage);
```

### Validate Content Length

```typescript
function validateContent(content: string): void {
  if (!content || typeof content !== 'string') {
    throw new Error('Content must be a non-empty string');
  }
  if (content.length > 100000) {
    throw new Error('Content exceeds maximum length');
  }
}

await db.ingest(validateContent(userInput));
```

## Rate Limiting

### Implement Rate Limits

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per minute
  message: 'Too many requests, please try again later'
});

app.use('/api/memory', limiter);
```

### Per-User Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.id  // Rate limit per user
});
```

## Authentication & Authorization

### Verify User Identity

```typescript
app.post('/api/memory/ingest', authenticate, async (req, res) => {
  // Ensure user can only access their own memories
  const userId = req.user.id;
  const db = new DeltaMemory({
    defaultCollection: `user-${userId}`
  });
  
  await db.ingest(req.body.content);
  res.json({ success: true });
});
```

### Implement RBAC

```typescript
function canAccessCollection(user: User, collection: string): boolean {
  // Admin can access all collections
  if (user.role === 'admin') return true;
  
  // Users can only access their own
  return collection === `user-${user.id}`;
}

app.post('/api/memory/recall', authenticate, async (req, res) => {
  const { collection } = req.body;
  
  if (!canAccessCollection(req.user, collection)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const db = new DeltaMemory({ defaultCollection: collection });
  const result = await db.recall(req.body.query);
  res.json(result);
});
```

## Browser Security

### Don't Expose API Keys in Browser

```typescript
// ❌ NEVER do this - exposes API key to client
const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY  // Visible in browser!
});

// ✅ Use a backend API instead
// Frontend:
const response = await fetch('/api/memory/recall', {
  method: 'POST',
  body: JSON.stringify({ query: 'user preferences' })
});

// Backend:
app.post('/api/memory/recall', async (req, res) => {
  const db = new DeltaMemory({
    apiKey: process.env.DELTAMEMORY_API_KEY  // Safe on server
  });
  const result = await db.recall(req.body.query);
  res.json(result);
});
```

## Logging & Monitoring

### Sanitize Logs

```typescript
// ❌ Don't log sensitive data
console.log('API Key:', apiKey);
console.log('User data:', userData);

// ✅ Log safely
console.log('API Key:', apiKey.substring(0, 6) + '...');
console.log('User ID:', userId);
```

### Monitor for Anomalies

```typescript
// Track unusual patterns
const stats = await db.stats();
if (stats.memory_count > 100000) {
  alert('Unusual memory growth detected');
}

// Monitor error rates
try {
  await db.ingest(content);
  metrics.increment('deltamemory.success');
} catch (error) {
  metrics.increment('deltamemory.error');
  if (error.code === 401) {
    alert('Authentication failure - possible key compromise');
  }
}
```

## Compliance

### GDPR Considerations

```typescript
// Right to be forgotten
async function deleteUserData(userId: string) {
  const db = new DeltaMemory({
    defaultCollection: `user-${userId}`
  });
  await db.purge();
}

// Data export
async function exportUserData(userId: string) {
  const db = new DeltaMemory({
    defaultCollection: `user-${userId}`
  });
  const stats = await db.stats();
  // Export all memories, profiles, events
  return {
    memories: await getAllMemories(db),
    profiles: await getAllProfiles(db),
    events: await getAllEvents(db)
  };
}
```

### Data Retention

```typescript
// Implement retention policies
async function enforceRetention() {
  const db = new DeltaMemory();
  
  // Delete memories older than 90 days
  const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
  // Implementation depends on your tracking
}
```

## Incident Response

### Have a Plan

1. **Detect**: Monitor for security events
2. **Respond**: Rotate compromised keys immediately
3. **Recover**: Audit affected data
4. **Learn**: Update security practices

### Key Compromise Response

```bash
# 1. Generate new API key from dashboard
# 2. Update environment variables
export DELTAMEMORY_API_KEY=dm_new_key_here

# 3. Restart services
kubectl rollout restart deployment/app

# 4. Revoke old key from dashboard
# 5. Audit access logs
```

## Security Checklist

Before deploying to production:

- [ ] API keys stored in secrets manager
- [ ] No hardcoded credentials in code
- [ ] HTTPS enforced for all connections
- [ ] SSL certificate verification enabled
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] User authentication required
- [ ] Authorization checks in place
- [ ] Per-user data isolation
- [ ] Sensitive data encrypted
- [ ] Logging sanitized
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented
- [ ] GDPR compliance reviewed
- [ ] Security audit completed

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@deltamemory.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We'll respond within 24 hours and work with you on a fix.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls)
- [DeltaMemory Security](https://deltamemory.com/security)

## Updates

This document is updated regularly. Last updated: January 2024

For the latest security guidance, visit: https://docs.deltamemory.com/security
