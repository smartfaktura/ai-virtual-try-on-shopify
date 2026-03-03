

## Merge "Publishing to" + "Generation Details" into One Unified Summary Card

The current results page has two separate cards — "Publishing to" (showing the product) and "Generation Details" (showing model, scene, settings). This feels disjointed. They should be one cohesive card that tells the full story of the generation.

### Design

```text
┌──────────────────────────────────────────────┐
│ Virtual Try-On Set                    Badge  │
│                                              │
│ ┌──────┐  ┌──────┐  ┌──────┐                │
│ │ prod │  │model │  │scene │                │
│ │ img  │  │ img  │  │ img  │                │
│ └──────┘  └──────┘  └──────┘                │
│ Product    Model     Scene                   │
│ "Ring"    "Charlotte" "Studio Profile"       │
│                                              │
│ 1:1 · High · Brand: X                       │
└──────────────────────────────────────────────┘
```

### Changes — `src/pages/Generate.tsx`

1. **Delete** the first "Publishing to" card (lines 2888-2912) and the separate "Generation Details" card (lines 2914-2968).

2. **Replace** with a single card:
   - Header: workflow name (e.g. "Virtual Try-On Set") or fallback "Generation Summary" — as a bold title, with workflow badge on the right if applicable.
   - Reference thumbnails row: product (always shown), model (if used), scene/pose (if used) — same 48×48 thumbnails, but product is now here instead of in a separate card. For flat-lay multi-product, show all product thumbnails in this same row.
   - Settings chips row: aspect ratio, quality, framing, brand profile — same badges.
   - Variation labels (if any) — same as current.
   - No "Publishing to" label, no "Generation Details" label — the card title and thumbnails are self-explanatory.

This is purely a restructure of existing JSX within a single file. No new state, no new imports needed.

