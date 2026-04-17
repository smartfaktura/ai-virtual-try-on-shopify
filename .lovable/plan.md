

## Goal
Fix the sticky plan-selector bar on `/app/pricing`:
1. Mobile: "Growth · Recommended" overflows on one line + price/credits hidden.
2. Desktop: bar is too narrow — should match the page content width (`max-w-6xl`) edge-to-edge.

## File
- `src/pages/AppPricing.tsx` (sticky bar block only, lines 638–674)

## Changes

### 1. Width — match content edge-to-edge
- Desktop: replace fixed `sm:w-[min(640px,calc(100vw-2rem))]` with the page content width — `sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-6xl` so the bar visually aligns with the comparison table and other sections.
- Mobile: keep `left-4 right-4` (already edge-to-edge with page padding).

### 2. Mobile — show price + credits, fix label overflow
Restructure the inner layout so on mobile we get a clean two-row arrangement that always fits:

- Left block (selector):
  - Tiny "SELECTED PLAN" label.
  - Native `<select>` shows just the **plan name** (e.g. "Growth"). Strip the " · Recommended" suffix from the option label on mobile by rendering only the name and putting "Recommended" as a small adjacent badge instead — prevents truncation in the trigger.
  - Directly under the name (mobile only): a compact meta line `$79/mo · 1,500 credits` in `text-[11px] text-muted-foreground`.
- Right block (CTA):
  - Keep the primary CTA. On mobile, shorten label to "Continue" when the plan is Growth/Starter/Pro and not the current plan (current logic produces "Continue with Growth" → too long). Use the full label on `sm+`. Implement via a `mobileLabel` derived from `cta.label.replace(/^Continue with .*/, 'Continue').replace(/^Choose .*/, 'Choose plan')`.

Result on mobile (390px):
```
┌─────────────────────────────────────────────┐
│ SELECTED PLAN              [ Continue → ]   │
│ Growth  [Recommended]                       │
│ $79/mo · 1,500 credits                      │
└─────────────────────────────────────────────┘
```

### 3. Desktop layout (≥sm)
Single row, full content width:
```
[ SELECTED PLAN ▼ Growth · Recommended ]   [ $79/mo · 1,500 credits ]   [ Continue with Growth → ]
```
With `justify-between` so the three blocks spread across the full bar.

### 4. Recommended badge
Render "Recommended" as a small `text-[9px] uppercase` pill next to the plan name (both viewports) instead of inside the `<select>` option label, so the trigger text stays short and never truncates.

## Out of scope
- Visibility logic (`pastCompare` / `atFinalCta`) — unchanged.
- StudioChat hide behavior — unchanged.
- Comparison table, FAQ, How credits work — unchanged.

## Result
- Sticky bar spans the same width as the page content on desktop (no longer floating narrow in the middle).
- Mobile shows plan name + Recommended badge + price + credits without truncation.
- CTA always fits on one line on mobile.

