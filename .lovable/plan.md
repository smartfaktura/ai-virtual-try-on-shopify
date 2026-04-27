# Show "Apply to all categories" on mobile consistently

## Problem

The button already exists and is mobile-styled (`w-full sm:w-auto`). But its visibility is tied to `activeIds.size > 0` — the **currently active** category must have shots. On mobile, the moment you tap an empty category tab to fill it, the button vanishes — exactly when you'd want to copy from a sibling category.

## Fix (one line of logic, zero new UI)

In `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

1. Change visibility condition from `activeIds.size > 0` to **"any category has shots"**.
2. Update `handleApplyToAll` to use the active category's selection if it has any, otherwise fall back to the most recently non-empty category's selection (track via a `useRef` updated in `handleChange`).

That's it. Same button, same placement, same styles, same copy. Just available whenever it would actually be useful.

## Files

- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — visibility condition + source-selection fallback in `handleApplyToAll`

## Out of scope

- Sticky bar untouched
- No new buttons, chips, hints, or layout changes
- Helper text under tabs unchanged