

# Link Onboarding to Add Product + Move Tips + Optimize Subtitle

## Changes

### 1. `src/components/app/OnboardingChecklist.tsx` (line 22-23)
Change the first onboarding step to link directly to the Add Product page:
- `path: '/app/products'` → `path: '/app/products/new'`
- `cta: 'Go to Products'` → `cta: 'Add Product'`

### 2. `src/components/app/ManualProductTab.tsx`
Move the dimensions tip (Kenji · Better results) from `ProductUploadTips` (which shows above the form) to inline after the dimensions input on mobile. Show it as a subtle hint below the dimensions field:

- After the dimensions `Input` (line 858-864), add a small inline tip visible only on mobile (`sm:hidden`):
```tsx
<p className="text-[11px] text-muted-foreground/70 sm:hidden mt-1">
  Tip: Add real dimensions (e.g. 15×10cm) for realistic scaling in scenes.
</p>
```

### 3. `src/components/app/ProductUploadTips.tsx`
No change needed — it already rotates tips and the Kenji tip will still show on desktop. The inline hint on mobile is a supplement.

### 4. `src/pages/AddProduct.tsx` (line 65)
Optimize subtitle from:
`"Upload images, import from a URL, or bulk-add via CSV. Each image = one product."`
To:
`"Add your product images to start generating visuals."`

### Files
- `src/components/app/OnboardingChecklist.tsx` — lines 22-23
- `src/components/app/ManualProductTab.tsx` — after line 864
- `src/pages/AddProduct.tsx` — line 65

