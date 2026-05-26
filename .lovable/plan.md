Align the "View in Library" button size/style with the primary "Swap more products" CTA on the Product Swap results screen.

**Edit in `src/pages/ProductSwap.tsx` (line 497):**

Change:
```tsx
<Button variant="ghost" size="sm" onClick={...}>
  View in Library
</Button>
```
to:
```tsx
<Button variant="outline" size="pill" onClick={...}>
  View in Library
</Button>
```

This matches the `size="pill"` used by Swap more products and the existing outline+pill style used by the Download all button, so all three buttons in the row share the same height and shape.