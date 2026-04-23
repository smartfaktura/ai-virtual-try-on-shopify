

## Polish Step 3 — pill buttons, hide Kidswear, shorter chip labels, cleaner Go back

Four small UX fixes on the onboarding Step 3 (and a label tweak in the shared taxonomy).

### 1. "Skip for now" → real pill button (white/alternative variant)

Replace the underlined text link with a proper `Button` matching the primary CTA's shape but in an alternative white style so the dark "Get Started" stays the dominant action.

```tsx
<Button
  variant="outline"
  size="pill"
  onClick={handleSkipStep3}
  disabled={saving}
  className="w-full mt-3 font-medium bg-background hover:bg-muted"
>
  Skip for now
</Button>
```

Result: same height/shape as `Get Started`, white background, subtle border — clearly secondary.

### 2. "Go back" → clean ghost pill button

The current bare text under "Skip for now" looks orphaned. Convert it to a `Button variant="ghost" size="pill"` so the three actions form a tidy vertical stack: dark pill → white pill → ghost pill.

Also applies to the same "Go back" rendered on Step 2 (keep it consistent across steps).

```tsx
<Button
  variant="ghost"
  size="pill"
  onClick={() => setStep(step - 1)}
  disabled={saving}
  className="w-full mt-2 font-medium text-muted-foreground hover:text-foreground"
>
  Go back
</Button>
```

### 3. Hide "Kidswear" from Step 3 for now

Remove `'kidswear'` from `FAMILY_SUB_ORDER.Fashion` in `src/lib/onboardingTaxonomy.ts`. The slug stays defined in `sceneTaxonomy.ts` (Catalog still works), it just won't render as a chip in onboarding/Settings.

Before:
```ts
Fashion: ['garments','hoodies','dresses','jeans','jackets','activewear','swimwear','lingerie','kidswear','streetwear'],
```

After:
```ts
Fashion: ['garments','hoodies','dresses','jeans','jackets','activewear','swimwear','lingerie','streetwear'],
```

Easy to re-enable later by adding it back to that one array.

### 4. Shorter chip labels — no overflowing pills

Two labels currently break the single-line pill aesthetic on a 390 px viewport (and even on desktop wrap awkwardly):

| Slug | Before | After |
|---|---|---|
| `garments` | Clothing & Apparel | **Clothing** |
| `activewear` | Activewear & Sportswear | **Activewear** |

Edit `SUB_FAMILY_LABEL_OVERRIDES` in `src/lib/sceneTaxonomy.ts` to set these shorter labels. Catalog will inherit the shorter labels too — which is desirable since pills there have the same constraint.

If you'd prefer Catalog keeps the longer names and only Onboarding uses short ones, say the word and we'll add an `ONBOARDING_LABEL_OVERRIDES` map in `onboardingTaxonomy.ts` instead.

### Files touched

```text
EDIT  src/pages/Onboarding.tsx          Skip + Go back as Buttons
EDIT  src/lib/onboardingTaxonomy.ts     remove 'kidswear' from Fashion order
EDIT  src/lib/sceneTaxonomy.ts          shorten 'garments' & 'activewear' labels
```

### Validation

1. Step 3 shows three vertically stacked buttons: dark "Get Started" → white "Skip for now" → ghost "Go back" — all same pill shape & width
2. Step 2 "Go back" matches the new ghost pill style
3. Fashion section in Step 3 no longer shows the Kidswear chip
4. Pills read "Clothing" and "Activewear" — fit on one line on 390 px viewport without wrapping

