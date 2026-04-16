

# Redesign Layer 1 — Success + Scale Card

## What Changes

Replace the current "feature pills" card with a "success + scale" card built around 3 value pillars: creation capacity, value at scale, and workflow efficiency.

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/conversionCopy.ts` | Replace `chips: string[]` with `valueBlocks: { icon: string; title: string; detail: string }[]` in Layer1Copy. Rewrite all 9 category entries with new headlines, behavior-aware subline function, and 3 value blocks per category |
| `src/components/app/PostGenerationUpgradeCard.tsx` | Full redesign — replace Sparkles with CheckCircle2, replace chips with 3 compact value blocks, replace "See what you can unlock" with solid primary CTA ("See Plans & Features"), add ghost secondary ("Maybe Later"), add `forceVisible` prop, add left accent border |
| `src/pages/AdminConversion.tsx` | Update `Layer1Preview` to render the new value blocks layout instead of chips. Update copy reference table columns to show value block titles instead of chips |

## New Card Layout

```text
┌──────────────────────────────────────────────────┐
│ ✓ {category headline}                   [dismiss]│
│   {behavior-aware subline}                       │
│                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│   │ ∞ icon   │ │ ↗ icon   │ │ ⚡ icon   │        │
│   │ Create   │ │ Better   │ │ Faster   │        │
│   │ More     │ │ Value    │ │ Workflow │        │
│   │ 1-line   │ │ 1-line   │ │ 1-line   │        │
│   └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│   [See Plans & Features]          Maybe Later    │
└──────────────────────────────────────────────────┘
```

## Copy Strategy

**Headlines** — reframed from "You just created your first X" to "First {category} direction — complete" (success-first tone)

**Sublines** — new `getLayer1Subline(category, behaviorHint?)` function that returns different copy based on optional behavior signal:
- Default: "Keep creating with more credits and stronger tools"
- `low-credits`: "You're running low — paid plans include monthly credits"
- `repeated-product`: "Scale your {category} catalog with monthly credits"
- `model-heavy`: "Paid plans support faster, larger creation workflows"

**Value blocks** (3 per category, same structure across all):
1. **More Creation Power** — icon: Layers, detail varies by category (e.g., "Monthly credits to keep creating {category} visuals")
2. **Better Value at Scale** — icon: TrendingUp, detail: "Higher plans improve your cost per visual"
3. **Faster Workflow** — icon: Zap, detail varies (e.g., "Priority processing and bulk generation")

**CTA**: Primary solid button "See Plans & Features" — secondary ghost "Maybe Later"

## Design Changes
- Left 2px accent border (primary gradient) instead of full gradient background wash
- CheckCircle2 icon (muted green) instead of Sparkles
- Value blocks: small bordered cards with icon, title, one-line detail — horizontal on desktop, vertical stack on mobile
- More breathing room (p-6 instead of p-5, gap-4 instead of gap-3)
- `forceVisible` prop bypasses 3s delay for admin preview

## Props Change
Add optional `behaviorHint?: string` prop to `PostGenerationUpgradeCard` for subline personalization. Pages that already render the card can pass it or omit it (falls back to default subline).

