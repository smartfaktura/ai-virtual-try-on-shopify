## Refinement: drop the green dots

The emerald dots clashed with the muted editorial palette. Replacing with the cleanest option: **three labels separated only by hairline dividers** — no icons, no color accents.

**File**: `src/components/seo/photography/category/CategoryHero.tsx` (lines 62–77)

```tsx
<ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-medium tracking-[-0.005em] text-muted-foreground/70">
  <li>Free to start</li>
  <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
  <li>No credit card</li>
  <li aria-hidden className="hidden sm:block h-3 w-px bg-border" />
  <li>Cancel anytime</li>
</ul>
```

Result:
```text
Free to start    │    No credit card    │    Cancel anytime
```

Pure typography + hairlines. Matches the editorial restraint of the breadcrumbs and eyebrow kicker. No color noise.
