

# Link "Create Visuals" Button to Product Images Flow

## Change
In `src/components/app/AppShell.tsx` line 204, change the navigation target from `/app/workflows` to `/app/generate/product-images`.

```typescript
// Line 204: change
onClick={() => handleNav('/app/workflows')}
// to
onClick={() => handleNav('/app/generate/product-images')}
```

### Files changed
- `src/components/app/AppShell.tsx` — one line change

