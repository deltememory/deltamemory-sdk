# Rebuild Instructions

If new pages aren't showing in the menu after deployment, follow these steps:

## Clear Build Cache

```bash
cd docs

# Remove build artifacts
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Reinstall dependencies (optional but recommended)
rm -rf node_modules
npm install

# Rebuild
npm run build

# Test locally
npm run start
```

## Vercel Deployment

If deploying to Vercel:

1. Go to your project settings
2. Navigate to "General" → "Build & Development Settings"
3. Add environment variable: `NEXT_PUBLIC_FORCE_REBUILD=true`
4. Trigger a new deployment
5. Or use: `vercel --force` to force rebuild

## Netlify Deployment

If deploying to Netlify:

1. Go to Site settings → Build & deploy
2. Click "Clear cache and deploy site"
3. Or add build command: `rm -rf .next && npm run build`

## Check These Files

Ensure these files are correct:

1. **`pages/_meta.json`** - All pages listed
2. **`pages/integrations/_meta.json`** - All integration pages listed
3. **All `.mdx` files exist** in their respective folders

## Current Structure

```
pages/
├── _meta.json                 ✓ Updated
├── index.mdx                  ✓ Exists
├── quickstart.mdx             ✓ Exists
├── concepts.mdx               ✓ New
├── production.mdx             ✓ New
├── troubleshooting.mdx        ✓ New
├── sdk-comparison.mdx         ✓ New
├── integrations/
│   ├── _meta.json             ✓ Updated
│   ├── vercel-ai-sdk.mdx      ✓ Exists
│   ├── langchain.mdx          ✓ Exists
│   ├── openai.mdx             ✓ New
│   └── mcp.mdx                ✓ Updated
├── sdk/
│   ├── _meta.json             ✓ Exists
│   ├── typescript.mdx         ✓ Exists
│   └── python.mdx             ✓ Exists
└── usage-patterns/
    ├── _meta.json             ✓ Exists
    ├── overview.mdx           ✓ Exists
    ├── automatic.mdx          ✓ Exists
    └── agent-tools.mdx        ✓ Exists
```

## Troubleshooting

### Pages accessible via URL but not in menu

This is a caching issue. Clear `.next` folder and rebuild.

### Menu shows old structure

1. Check `_meta.json` files are correct
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Rebuild with cache cleared

### Dark mode logo not switching

1. Ensure `next-themes` is installed: `npm install next-themes`
2. Clear `.next` folder
3. Rebuild

## Production Checklist

Before deploying:

- [ ] All `.mdx` files created
- [ ] All `_meta.json` files updated
- [ ] Build succeeds locally: `npm run build`
- [ ] Test locally: `npm run start`
- [ ] Clear deployment cache
- [ ] Deploy with force rebuild
- [ ] Test in production
- [ ] Hard refresh browser
