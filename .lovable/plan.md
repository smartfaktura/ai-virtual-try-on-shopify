

# Modernize Catalog Studio Generation UI

## What changes

The current generation/progress screen feels basic — plain card with a camera icon, simple progress bar, and generic layout. We'll upgrade it to a polished, branded VOVV.AI experience.

### 1. In-Progress State Redesign (lines 474-529)

**Replace** the current plain card with a premium generation experience:
- **Animated gradient ring** around the camera icon instead of a ping animation — subtle rotating conic gradient in primary tones
- **Phase pill badge** at the top: "PREPARING" / "GENERATING" / "COMPLETE" with animated dot indicator
- **Larger, bolder progress bar** with gradient fill and percentage label inline
- **Stats row** redesigned as pill chips: `⏱ 0:09` · `3 of 8 images` · `~2 min left`
- **Team avatar** gets a subtle glow ring and the message moves next to it in a frosted card
- **VOVV.AI watermark** at bottom of the generation card
- Cancel button styled as ghost with muted text, bottom-right aligned

### 2. Product Progress Cards (lines 546-568)

**Upgrade** per-product rows:
- Add a subtle left border accent color (primary) on active product
- Shimmer skeleton placeholder for products still queued
- Checkmark animation on completion (scale-in)
- Tighter spacing, font refinements

### 3. Completion State Redesign (lines 349-424)

**Upgrade** the success/failure cards:
- Success: confetti-like gradient background wash, larger icon with subtle animation
- Stats displayed as inline metric chips: "8 images · 2m 14s · 4 products"
- Action buttons elevated: primary CTA "View in Library" gets full-width on mobile, "Download All" and "New Set" as secondary
- Failed/empty states get clearer iconography and actionable retry button

### 4. Preparing State (lines 312-330)

- Add pulsing dots animation below the spinner text
- Branded gradient background wash behind the card

### 5. Live Image Grid (lines 571-599)

- Images fade in with `animate-fade-in` on appearance
- Add subtle scale-up hover effect
- Shot label badges get semi-transparent frosted glass style

## Files to update

- `src/pages/CatalogGenerate.tsx` — All generation UI states (preparing, in-progress, completion)

## Technical approach

Pure CSS/Tailwind styling changes with minor structural JSX updates. No logic changes. Uses existing design tokens from `index.css` (primary, muted, surface colors). Adds a couple of keyframe animations via Tailwind arbitrary values or inline styles for the gradient ring.

