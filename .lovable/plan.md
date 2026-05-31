## Objective
Restyle the upscale quality badge (4K, 2K, HD) in the Library Detail Modal to use a solid pill shape with primary background and white text, removing the Sparkles icon.

## Changes

### File: `src/components/app/LibraryDetailModal.tsx`

**Current badge (lines 292-295):**
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
  <Sparkles className="w-3 h-3" /> {upscaleLabel}
</span>
```

**New badge:**
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
  {upscaleLabel}
</span>
```

**What changes:**
- Remove the `<Sparkles>` icon import usage (keep import if used elsewhere)
- Remove `gap-1` from the flex container
- Change `rounded-md` to `rounded-full` (pill shape)
- Change `bg-primary/10 text-primary` to `bg-primary text-primary-foreground` (solid blue background, white text)
- Increase horizontal padding from `px-2` to `px-2.5` for better pill proportion
- Keep `text-xs font-semibold uppercase tracking-wider`

**Scope guardrails:**
- Only affects this one badge in the modal header
- Does not touch the "Re-enhance" button Sparkles icon or "Enhancing..." status elsewhere in the file
- Does not change how `upscaleLabel` itself is determined

## Expected result
The 4K/2K/HD badge renders as a compact blue pill with white text, without the sparkle icon.