## Issue

The "Free to start · No credit card required" line currently reads as a heavy gray block sitting awkwardly under the CTA. It uses `text-sm` + full `text-muted-foreground`, no visual anchor, and competes with the buttons instead of supporting them. In the screenshot it looks disconnected — like a leftover footnote.

## Proposed refinement (modern vovv.ai / 2026-forward trust row)

Replace the single muted line with a **trust row** of two micro-signals separated by a hairline divider, anchored by tiny status dots. This is the pattern Linear, Vercel, Arc, Raycast use under hero CTAs — it feels lightweight, structured, and intentional rather than apologetic.

**File**: `src/components/seo/photography/category/CategoryHero.tsx` (lines 62–64)

### Visual spec

```text
●  Free to start    │    ●  No credit card    │    ●  Cancel anytime
```

- **Container**: `mt-5 flex flex-wrap items-center gap-x-4 gap-y-2`
- **Each item**: `inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground/70 font-medium tracking-[-0.005em]`
- **Status dot**: `h-1.5 w-1.5 rounded-full bg-emerald-500/80` (subtle living signal — the only color accent in the copy column, ties to "free / available")
- **Dividers**: thin `h-3 w-px bg-border` between items (only on `sm+`, hidden on mobile via `hidden sm:block`)
- **Weight**: drop from `text-sm` (14px) → `12.5px`, opacity `/70` so it recedes behind the CTA but stays legible
- **No leading bullet, no full-stop, no sentence form** — three discrete chips of reassurance

### Why this works

1. **Hierarchy restored**: CTA dominates, trust row supports — it no longer competes
2. **Three signals > one sentence**: more reassurance, less visual weight per item
3. **Modern pattern**: matches the editorial restraint of the rest of the hero (hairline eyebrow prefix, ultra-minimal breadcrumbs)
4. **The green dot** adds one micro-moment of life without breaking the muted palette

### Alternative (simpler) if you prefer to keep one line

Just refine the existing line:
- `text-[12.5px] text-muted-foreground/65 font-medium tracking-[-0.005em] mt-5`
- Keep the `·` separator, drop weight + opacity so it visually recedes

I'll implement the **3-chip trust row** unless you'd rather go with the simpler one-line refinement.
