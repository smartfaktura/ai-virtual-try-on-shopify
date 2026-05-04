
## Problem

The Product Details card has no save feedback, and with multiple products the list grows unbounded without any visual cues about completion status.

## Changes

### 1. ProductSpecsCard.tsx — Full UX overhaul

**Auto-save with visual feedback:**
- Add a debounced save mechanism (800ms after typing stops) that persists specs to `user_products.dimensions` immediately, not just at generation time.
- Show a subtle "Saved" check icon next to each product row after save completes. While saving, show a small spinner.
- Remove the fire-and-forget save from `ProductImages.tsx` generation handler (keep it as a fallback but avoid double-writes).

**Collapsed state shows summary:**
- When collapsed, show a single-line summary like "2 of 3 products have details" so the user knows status at a glance.

**Scrollable list for many products:**
- Wrap the product list in a `max-h-[320px] overflow-y-auto` container so 5+ products don't push the page down endlessly.

**Per-product collapse (accordion):**
- Each product row becomes a mini-accordion: thumbnail + name + category + filled/empty indicator on the header line; textarea revealed on click. This keeps the card compact when many products are selected.
- First product with empty specs auto-opens.

**Character count:**
- Show `{length}/500` counter below each textarea, muted, right-aligned.

### 2. ProductImages.tsx — Remove duplicate save

- Keep the existing `details.productSpecs` persist block as a safety net but skip products already saved by the card's auto-save (check a local set or simply let the upsert be idempotent).

### 3. productSpecFields.ts — No changes needed

Existing `sanitizeSpecInput`, `getCategoryPlaceholder`, `getCategoryLabel` stay as-is.

## Technical details

- Auto-save uses `supabase.from('user_products').update({ dimensions }).eq('id', pid)` with `buildSpecsPromptLine` sanitization.
- Debounce via `useRef` + `setTimeout` pattern per product ID.
- Save status tracked in local `Record<string, 'idle' | 'saving' | 'saved'>` state, reset to idle on next keystroke.
- Accordion uses simple local `openProductId: string | null` state (single open at a time to keep it tidy).
