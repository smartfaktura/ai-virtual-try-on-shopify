Add a small "NEW" pill badge next to the "YOUR BRAND MODELS" section header in `src/components/app/product-images/ProductImagesStep3Refine.tsx`.

Both occurrences (inline view + full modal):
- Inline header (currently `Crown` + label)
- Modal header (currently `Crown` + label)

Append after the label span:
```tsx
<span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[9px] font-semibold tracking-[0.15em] uppercase px-1.5 py-0.5">
  New
</span>
```

No other changes.