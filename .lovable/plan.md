

## What user wants

Two related UX issues in the compact "Upload images" mode:

1. **Action buttons hidden** — the "Add product" / "Cancel" footer is below the fold and the user has to scroll to find it. Especially after AI analysis fills the form, there's no obvious "done" affordance.
2. **Card too tall when 1+ images pasted** — the giant 88px reference slot grid + product details form takes most of the viewport. After AI auto-fills the fields, the user usually just wants to confirm and submit. The big editable card should collapse into a compact row, with an option to expand if they want to edit.

## Plan

### Fix 1 — Sticky footer with primary action

In `src/components/app/ManualProductTab.tsx`, the footer with "Add product" / "Cancel" buttons currently scrolls with content. Make it **sticky to the bottom of the modal** with a subtle top border + background blur. This guarantees the primary CTA is always visible no matter how much the user scrolls or how many images they paste.

Approach:
- Wrap the existing button row in a `sticky bottom-0` container with `bg-background/95 backdrop-blur` + `border-t` + negative horizontal margins to bleed to drawer edges.
- The scroll container in `AddProductModal` already handles overflow — sticky will pin to its bottom edge.

### Fix 2 — Auto-collapse cards once AI analysis completes

In `ManualProductTab.tsx`, the batch item card (and single-item card) currently always shows the full editable form. Change behavior:

- **While analyzing**: show current card with spinner.
- **After analysis completes successfully** (title + productType filled): auto-collapse into a **compact row** showing:
  - thumbnail (48px)
  - product name + type (small subtitle)
  - "Edit" pencil button → expands the card back to full form
  - remove (×) button
- **If analysis failed** or user manually expanded: show full editable card.

Track an `isCollapsed` boolean per item (default `true` once analysis succeeds, `false` while analyzing or on fail). Clicking Edit toggles to `false`; the card can be re-collapsed via a small chevron in the expanded header.

### Fix 3 — Smarter "single → batch" threshold

Currently the first paste shows the giant single-card form. From the second paste onward it promotes to batch. Keep that behavior but apply the same collapse logic to the single card too — once AI fills it, collapse to the same compact row. This keeps the modal short and the sticky "Add product" CTA right under the row.

## Files to edit

- `src/components/app/ManualProductTab.tsx`
  - Add sticky footer wrapper around the action buttons.
  - Add per-item `isCollapsed` state (set true when analysis succeeds).
  - Render compact-row variant when collapsed; wire Edit button to expand.
  - Apply the same collapsed-row treatment to the single-item card.

## Result

- "Add product" and "Cancel" buttons are **always visible** at the bottom of the drawer, even with multiple pasted images.
- After AI fills the details, each product collapses into a tidy one-line row (thumb + name + type + edit/remove). User can click "Add product" immediately, or click Edit on any row to fine-tune.
- Modal stays short and scannable; matches the "minimalist luxury restraint" aesthetic in core memory.

