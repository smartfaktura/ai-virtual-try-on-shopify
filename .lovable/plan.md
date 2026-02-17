

## Fix: Glitchy Corners on Mobile/Tablet Prompt Panel

### Problem

On mobile and tablet, the rounded top corners of the prompt panel show visual artifacts because:
1. **Semi-transparent background** (`bg-background/80`) lets gallery content bleed through at the curved edges
2. **Custom shadow** (`shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.08)]`) spreads beyond the rounded corners, creating a visible edge
3. **Tablets** (768px+) get the desktop styling with a visible `border` and `shadow-lg`, which looks wrong since the panel is docked like mobile

### Fix

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx` (line 169)**

- Change `bg-background/80` to `bg-background` -- fully opaque so no content bleeds through at corners
- Soften the mobile shadow to a tighter, subtler spread: `shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.06)]`
- These two changes eliminate the visible edge artifacts at the rounded corners

```tsx
// Before (line 169-171):
'relative bg-background/80 backdrop-blur-xl transition-colors duration-200',
isMobile
  ? 'rounded-t-3xl border-0 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.08)]'

// After:
'relative bg-background backdrop-blur-xl transition-colors duration-200',
isMobile
  ? 'rounded-t-3xl border-0 shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.06)]'
```

### Result
- Opaque background prevents content from showing through the curved edges
- Tighter shadow eliminates the visible spread artifacts at the corners
- Desktop styling unchanged (keeps its own border/shadow)

### Files
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- 2 small value changes on lines 169 and 171

