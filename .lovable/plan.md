
Two pages have section headers using inconsistent (smaller) styles vs the canonical dashboard style (`text-2xl sm:text-3xl font-bold tracking-tight` + `text-base text-muted-foreground mt-1.5`).

### Investigation
Need to locate:
- `/app/workflows` page → "Recent Creations" / "Pick up where you left off" header
- `/app/video` page → "Showcase" / "See what's possible" header

### Fix
Update both header blocks to match the canonical style:
```tsx
<h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Title</h2>
<p className="text-base text-muted-foreground mt-1.5">Subtitle</p>
```

### Files touched (~2)
- `src/pages/Workflows.tsx` (or equivalent)
- `src/pages/Video.tsx` (or equivalent)

### Acceptance
- Both section headers visually match Dashboard section headers
- No other changes
