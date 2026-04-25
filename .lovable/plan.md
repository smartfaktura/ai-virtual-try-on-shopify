## Always show the Brand Models CTA on screen

The CTA currently sits only at the very start of each marquee row. Since the row is tripled for the loop, the card only passes by every ~30+ models — so for stretches of the marquee the user sees no CTA at all (matches the screenshots).

### Fix
Interleave the CTA every **6 models** in each row. With 6–8 cards visible per screen at any given time, that guarantees at least one Brand Models card is always on screen.

Add a small helper inside the `useMemo` in `ModelShowcaseSection.tsx`:

```ts
const INTERLEAVE = 6;
const interleaveCta = (models: ModelItem[]): ModelItem[] => {
  const out: ModelItem[] = [{ kind: 'cta' }];
  models.forEach((m, i) => {
    out.push(m);
    if ((i + 1) % INTERLEAVE === 0 && i !== models.length - 1) {
      out.push({ kind: 'cta' });
    }
  });
  return out;
};
```

Build each row as `interleaveCta(processed.slice(...).map(wrap))` so:
- Row 1 starts with CTA, then a CTA every 6 models.
- Row 2 same pattern, but offset visually because `direction='right'` and a different list — keeps it from looking like a vertical column.

Also fix the model-count line: `{row1.length + row2.length - ctaCount}+ AI Models` (subtract the actual number of CTAs inserted, not just `2`). Compute `ctaCount = row1.filter(i => i.kind === 'cta').length + row2.filter(i => i.kind === 'cta').length`.

### Optional polish
None — the CTA card's visual style stays exactly as it is now (light, hairline border, readable text).

**Single file edited:** `src/components/landing/ModelShowcaseSection.tsx`. Approve to apply.