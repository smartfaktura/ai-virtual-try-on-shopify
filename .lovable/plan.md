

# Fix Badge Colors + Smaller Bullets in NoCreditsModal

## Problem
The `bg-muted` / `text-muted-foreground` tokens resolve to dark colors in the app's dark theme context, so the SAVE/NEW badges still appear dark despite the previous change.

## Fix
Replace semantic theme tokens with explicit Tailwind utility colors that are always light grey:

### In `src/components/app/NoCreditsModal.tsx`

**Line 179** — Plan card feature badges:
```
bg-muted text-muted-foreground → bg-gray-100 text-gray-500
```

**Line 316** — Upgrade strip feature badges:
```
bg-muted text-muted-foreground → bg-gray-100 text-gray-500
```

This ensures badges are light grey regardless of the surrounding theme context. No logic changes.

