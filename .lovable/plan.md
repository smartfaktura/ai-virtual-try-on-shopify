

# Improve Prompt Builder Design + Fix Logic for All Paths

## Problems

1. **Design**: Category cards look plain — thin borders, too much empty space, descriptions missing. The overall feel is generic.
2. **Logic bug — Faceless framing**: `faceless` is treated as `isPerson = true`, so the framing step offers "Full Body" and "Side Profile" — makes no sense for hands/body-only shots. Should only show `close-up`, `hand-focus`.
3. **Logic bug — Faceless interaction**: "Worn / Used Naturally" makes sense for fashion but not all categories when faceless. This is minor but should be reviewed.

## Changes

### 1. `src/components/app/freestyle/PromptBuilderQuiz.tsx` — Design Refresh

**OptionCard redesign:**
- Remove the heavy `border-2` — use `border` with subtle shadow on hover
- Reduce padding on mobile (`p-3` instead of `p-4`)
- Make selected state cleaner: light primary bg + primary border, smaller check badge
- Icons slightly smaller on mobile (`w-4 h-4` mobile, `w-5 h-5` desktop)

**Category grid:**
- Use `grid-cols-3 sm:grid-cols-4` (already done) but tighten gap to `gap-2 sm:gap-3`
- Add compact descriptions back to category cards (e.g., "Clothing, shoes" for Fashion)

**Section headers:**
- Keep current style but make subtitle slightly more muted
- "With Person" / "Product Only" labels: style as tiny pill badges instead of plain uppercase text

**Progress bar:**
- Make thinner: `h-1` instead of `h-1.5` for a more refined look

### 2. `src/lib/promptBuilderTemplates.ts` — Fix Framing Logic

**`getFramingOptions`**: Add a check for `faceless` subject. New signature: `getFramingOptions(category, subject?)`.
- If `subject === 'faceless'`: return only `close-up`, `hand-focus`
- Otherwise: keep existing category-based filtering

**`getInteractionOptions`**: No change needed — "worn" for faceless hands makes sense (e.g., wearing a ring, holding product).

### 3. `src/components/app/freestyle/PromptBuilderQuiz.tsx` — Pass Subject to Framing

In `renderFramingStep`, pass `subject` to `getFramingOptions`:
```tsx
const opts = getFramingOptions(category!, subject!);
```

### 4. `src/lib/promptBuilderTemplates.ts` — Faceless Prompt Fix

Update `SUBJECT_FRAGMENTS` for faceless to be more descriptive:
```ts
faceless: 'A faceless composition featuring elegant hands and partial body',
```

Update `FRAMING_FRAGMENTS` for faceless-compatible options to work naturally.

## Files
- `src/components/app/freestyle/PromptBuilderQuiz.tsx` — design refresh + pass subject to framing
- `src/lib/promptBuilderTemplates.ts` — fix `getFramingOptions` to accept subject param, filter for faceless

