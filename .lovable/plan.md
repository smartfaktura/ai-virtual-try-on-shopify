## Changes

### 1. Remove "selected" look on Suggested model card
`src/features/brand-scenes/wizard/components/FeaturedModelPicker.tsx` (line 237-239)

Use the same neutral border/hover classes for suggested and unsuggested cards. The "SUGGESTED" badge alone communicates the recommendation — no border ring needed.

```tsx
className={cn(
  "group relative flex flex-col items-stretch overflow-hidden rounded-xl border border-border bg-background text-left transition-all",
  "hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm",
)}
```

### 2. Hide Energy/Vibe section and Custom settings on People sub-step
`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`

- Delete the `Energy / vibe` Section block (lines 694-712).
- Delete the `Custom settings` collapsible button + collapsed-state hint (lines 714-729) AND the `{customOpen && (...) }` block (lines 731-790) — gender / age / build / ethnicity inputs go away with it. Keep the `useState(customOpen)` removal too.
- Keep the lingerie mood block and everything below untouched (still gated by `lingerie`, doesn't depend on customOpen).
- Remove the now-unused `peopleVibeMissing` calc, `vibeMissing` prop on `PeopleTab`, and the `defaultStep4People` patch that sets `vibe = "editorial"` (line ~202). Drop the `hasCustomValues` / `customOpen` state.

`src/features/brand-scenes/wizard/step4Flow.ts`

- In `getSubStepDisabledReason` for `sub === "people"`, drop the vibe check and return `null` (People tab becomes informational only; Next is gated by other tabs).

### 3. Mark Styling slots as optional
`src/features/brand-scenes/wizard/components/OutfitQuiz.tsx`

Update the Section labels:
- `Top` → `Top · optional`
- `Bottom` → `Bottom · optional`
- `Footwear` → `Footwear · optional`
- Outfit vibe already shows "· optional" when not required — leave as is.

The Wardrobe color anchor in StylingTab already says "· optional"; the dynamic `extraFields` from `ExtrasPillField` inherit their own optional labelling — no change there.

## Result
- Suggested model card looks identical to siblings (only the badge differentiates it).
- People sub-step shows only the Featured Model picker — no vibe/custom settings clutter, and Next isn't blocked there.
- Styling tab clearly marks every wardrobe slot as optional.

## Files touched
1. `src/features/brand-scenes/wizard/components/FeaturedModelPicker.tsx`
2. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
3. `src/features/brand-scenes/wizard/step4Flow.ts`
4. `src/features/brand-scenes/wizard/components/OutfitQuiz.tsx`
