

## Fix: Zoomed-in images in Environment Showcase section

### Root cause

In `EnvironmentShowcaseSection.tsx` line 80, the `getOptimizedUrl` call passes `width: 400`:

```typescript
src={getOptimizedUrl(env.image, { width: 400, quality: 60 })}
```

This tells Supabase's image transformation to resize to 400px wide, which crops/zooms the image server-side before the browser displays it. The project's own convention (noted in existing patterns) is to **avoid `width` parameters** for showcase images and only use quality compression.

### Fix — `src/components/landing/EnvironmentShowcaseSection.tsx`

Remove `width: 400` from the `getOptimizedUrl` call, keeping quality-only compression:

```typescript
// Before:
src={getOptimizedUrl(env.image, { width: 400, quality: 60 })}

// After:
src={getOptimizedUrl(env.image, { quality: 60 })}
```

Single line change, one file.

