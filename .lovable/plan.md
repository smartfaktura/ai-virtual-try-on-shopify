

# Redesign: Reference Angles Section in Add Product

## Current Problems (from screenshot)
1. **Disabled placeholders look broken** — greyed-out boxes with 50% opacity feel like a bug, not a feature hint
2. **Too much vertical space wasted** — the 3 placeholder boxes + header + helper text add ~130px of dead UI before the user has even uploaded anything
3. **Visually disconnected** — the reference section floats between the dropzone and the form fields with no clear relationship
4. **Redundant messaging** — "Upload main image first, then add extra angles" repeats what the disabled state already implies
5. **No value proposition** — users don't understand WHY they'd want to add extra angles

## Proposed Design: Collapse Pre-Upload, Expand Post-Upload

### Before upload (empty state)
Remove the 3 disabled placeholder boxes entirely. Instead, add a **single subtle inline hint** inside the dropzone itself:

```text
┌──────────────────────────────────────┐
│           📷                         │
│   Drop images, browse, or paste     │
│   Each image creates a product      │
│                                      │
│   💡 Tip: Add back & side views     │
│      after uploading for better AI  │
└──────────────────────────────────────┘
```

This is a 1-line tip (11px, muted) inside the dropzone — no extra boxes, no wasted space.

### After upload (main image present)
Keep the current stacked layout but improve it:

1. **Better section header** — "Add extra angles for better AI results" with a camera icon, no "Optional" badge (it's implied)
2. **Larger slots (88px)** with a subtle "+" icon and bolder labels
3. **Add a micro-illustration** — show a tiny diagram of front/back/side to communicate what's expected
4. **Wrap in a collapsible** — starts expanded, but can be collapsed to save space if the user doesn't want refs

### Layout after upload:
```text
┌─────────────────────────┐
│     Main Image (280px)  │
└─────────────────────────┘

📐 Extra angles improve AI accuracy
┌──────────┐ ┌──────────┐ ┌──────────┐
│  ↺  +    │ │  →  +    │ │  📦  +   │
│ Back     │ │ Side     │ │ Packaging│
│ view     │ │ view     │ │          │
└──────────┘ └──────────┘ └──────────┘
          ▾ Hide angles
```

## Changes

### `src/components/app/ManualProductTab.tsx`

**1. Remove pre-upload placeholder boxes (lines 768-791)**
Delete the entire "Pre-upload reference angle placeholders" block. Replace with a single tip line inside the dropzone (after the "Each image creates a separate product" line):
```tsx
<p className="text-[10px] text-muted-foreground/50 mt-1">
  💡 You can add back, side & packaging views after uploading
</p>
```

**2. Improve post-upload reference section (lines 852-905)**
- Remove "Optional" badge — clutters the header
- Change header to: "Extra angles improve AI accuracy" with a camera/layers icon
- Increase slot size from `w-20 h-20` (80px) to `w-[88px] h-[88px]`
- Add a visible `+` icon above the angle icon in empty slots
- Make labels 11px instead of 10px
- Wrap in a `Collapsible` that starts open, with a "Hide angles" / "Show angles" toggle

**3. Style refinements**
- Empty slots: stronger border (`border-border/70`), slightly more background (`bg-muted/10`)
- Hover state: `hover:bg-muted/20 hover:border-primary/30` for clearer interactivity
- Filled slots: add a subtle green checkmark badge in the corner

## Files
- `src/components/app/ManualProductTab.tsx` — ~50 lines modified

## What stays the same
- StoreImportTab role cycling (already improved)
- HoverCard previews on filled slots
- Upload/submit logic
- Edit mode behavior

