

# Fix: Prevent Auto-Reload During Video Generation

## What Happened
A new build deployed while your short film was generating. The `versionCheck.ts` auto-reload mechanism only excludes `/app/catalog` and `/app/generate/product-images` — it does NOT exclude `/app/video/short-film`. The page force-reloaded, destroying your in-memory generation state.

## Fix

### File: `src/lib/versionCheck.ts`
Add `/app/video` to the exclusion list. This covers all video workflows (short-film, animate, hub) since they all hold in-memory generation state:

```typescript
if (window.location.pathname.startsWith('/app/video')) return;
```

This single line protects all video routes from mid-generation reloads.

