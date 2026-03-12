

## Speed Up Freestyle Showcase Animation & Fix Mobile Performance

### Problem
1. Animation is too slow — typing, chip activation, and generate all have long delays making it feel sluggish
2. On mobile, the large `blur-2xl` background div causes rendering lag (GPU-intensive filter on a 500px element)
3. Frequent state updates during typing (every 50ms) can cause jank on lower-end mobile devices

### Changes in `src/components/landing/FreestyleShowcaseSection.tsx`

**1. Faster animation timing:**

| Phase | Current | New |
|-------|---------|-----|
| Typing speed | 50ms / 2 chars | 30ms / 3 chars |
| Product chip | 3000ms | 1500ms |
| Scene chip | 4000ms | 2200ms |
| Generate starts | 6000ms | 3000ms |
| Progress steps | 6200/6600/7000 | 3200/3500/3800 |
| Results show | 7500ms | 4200ms |
| Result cards stagger | 7700 + i×300 | 4400 + i×200 |
| Full cycle | 12000ms | 8000ms |

**2. Mobile performance fixes:**
- Remove `blur-2xl` on the background blob for mobile (keep `md:blur-3xl` for desktop) — use a simple low-opacity gradient instead
- Reduce typing state updates by bumping to 3 chars per tick at 30ms

Single file change only.

