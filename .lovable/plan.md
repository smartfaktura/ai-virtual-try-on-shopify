Match the library modal's "How was this result?" feedback card to the product-images modal: blend it into the panel instead of standing out as a white card.

**Change** in `src/components/app/LibraryDetailModal.tsx` (line 458 block):

Add the same `className` override already used in `ResultDetailModal.tsx`:

```tsx
className="[&>div]:bg-transparent [&>div]:border-border/40"
```

This makes the inner `bg-card` transparent and softens the border, so the feedback section reads as part of the side panel instead of a separate white block.