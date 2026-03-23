

# Improve Start Workflow Modal UX + Fix Product Images

## Problems
1. **Product images broken** - using `object-contain` which makes images float/look bad. Products page uses `object-cover` with `ShimmerImage` - we should match that pattern.
2. **No confirmation step** - clicking a product immediately navigates away. Better UX: select product (highlight it), then confirm with a button.
3. **Back button is a tiny text link** - should be a proper button in a footer/header area.

## Changes

### `src/components/app/StartWorkflowModal.tsx` (rewrite product step)

**1. Add `selectedProductId` state** for two-step select-then-confirm:
```ts
const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
```

**2. Product grid - use `ShimmerImage` with `object-cover`** (matching Products page pattern):
```tsx
import { ShimmerImage } from '@/components/ui/shimmer-image';

// Each product card:
<div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
  <ShimmerImage
    src={getOptimizedUrl(p.image_url, { quality: 70 })}
    alt={p.title}
    className="w-full h-full object-cover"
    aspectRatio="1/1"
  />
</div>
```

**3. Selected state on product cards** - ring/border highlight when selected:
```tsx
className={cn(
  "... rounded-lg border-2 transition-all",
  selectedProductId === p.id 
    ? "border-primary ring-2 ring-primary/20" 
    : "border-border hover:border-primary/40"
)}
```

**4. Footer with Back + Continue buttons** for the product step:
```tsx
<div className="flex items-center justify-between pt-4 border-t">
  <Button variant="ghost" size="sm" onClick={() => setStep('workflow')}>
    <ArrowLeft /> Back
  </Button>
  <Button 
    onClick={() => handleSelectProduct(selectedProductId!)}
    disabled={!selectedProductId}
  >
    Continue <ArrowRight />
  </Button>
</div>
```

**5. Same footer pattern for upload step** - Back button at bottom instead of inline text link.

**6. Reset `selectedProductId`** when going back or closing modal.

### Files
- `src/components/app/StartWorkflowModal.tsx` - add ShimmerImage import, selectedProductId state, confirmation button, proper back buttons, fix image display

