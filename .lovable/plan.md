# Three small upload-review polish fixes

## 1. "Suggested" badge — match /app/products style

In `/app/products` the category chip beside the product title uses the shared `<Badge variant="secondary">…</Badge>` component (dark navy pill, white text). I'll reuse the exact same component in the review popup.

- Remove the custom "CATEGORY · SUGGESTED" header row.
- Place `<Badge variant="secondary">Suggested</Badge>` inline to the right of the category dropdown so it sits next to the resolved label (e.g. next to "Dress").
- Badge disappears the moment the user changes the dropdown (already the behavior).
- "Pick one" fallback for failed analysis also becomes a `<Badge variant="destructive">`.

## 2. Analyzing placeholder no longer breaks the grid

The dashed border + thicker frame + extra padding made the placeholder card taller than neighbouring product cards. I'll make it visually identical to a regular product card:

- Drop the dashed border, keep the same `rounded-xl` and `border-2 border-transparent` treatment as a normal card.
- Keep the same `aspect-square` thumbnail and the same `h-[44px]` label area (so row heights line up exactly with surrounding products).
- Image is dimmed to ~40% opacity with a small centered spinner overlay.
- Label area shows: "Analyzing…" + "Detecting category" in the same `text-[10px]` / `text-[9px]` sizing as product cards.

## 3. Save button uses dot loader, not spinner

Replace the `Loader2` spinner inside the "Save N products" button with the same three bouncing dots used in `StudioChat`:

```tsx
<span className="flex items-center gap-1">
  <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
  <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
  <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
</span>
```

Button label stays "Save N products" — dots replace the spinner only.

## Files touched

- `src/components/app/BulkUploadReviewModal.tsx` — Badge + dot loader.
- `src/pages/ProductImages.tsx` — analyzing placeholder card markup.

No backend, no analyzer, no flow changes.
