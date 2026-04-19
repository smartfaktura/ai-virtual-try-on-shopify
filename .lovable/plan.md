
## Fix "Create Your Brand Model" button (broken route)

### Cause
The button calls `window.open('/app/brand-models', '_blank')`, but that route doesn't exist. The actual route registered in `App.tsx` is `/app/models` (component: `BrandModels`). So the new tab opens to a 404 / blank page — the user perceives it as "not working".

### Fix
Replace the URL in **both** affected buttons:
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` (line 165)
- `src/components/app/catalog/CatalogStepModelsV2.tsx` (line 116)

From:
```ts
window.open('/app/brand-models', '_blank')
```
To:
```ts
window.open('/app/models', '_blank')
```

### Optional UX upgrade (recommended)
Opening in a new tab forces the user to leave the wizard mid-flow and lose context. Better: use `useNavigate()` and navigate in the same tab (the user can return via back button), OR keep `_blank` but at least to the correct URL.

I'll use **same-tab `navigate('/app/models')`** to match how the rest of the app navigates between Studio sections. If you prefer keeping the new-tab behavior, say so and I'll just fix the URL.

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- `src/components/app/catalog/CatalogStepModelsV2.tsx`

### Validation
1. Click "Create Your Brand Model" in Step 3 (Product Images) → lands on `/app/models` Brand Models page
2. Same click in Catalog Studio Models step → same destination
3. After creating a model and returning, it appears under "Your Brand Models"
