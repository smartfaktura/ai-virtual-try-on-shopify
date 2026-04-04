

# Fix: Product Images page crash — Missing TooltipProvider

## Problem

The page crashes with: `Tooltip must be used within TooltipProvider`. This was introduced when tooltips were added to `ProductContextStrip.tsx` in the previous round. The `Tooltip` component from Radix requires a `TooltipProvider` ancestor.

## Fix

**File**: `src/components/app/product-images/ProductContextStrip.tsx`

Wrap the tooltip-containing content with `<TooltipProvider>`. Import `TooltipProvider` from `@/components/ui/tooltip` and wrap the `<div>` that contains the product thumbnails.

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Wrap the outer container:
<TooltipProvider>
  <div className="flex items-center gap-3 ...">
    ...
  </div>
</TooltipProvider>
```

Single file, single line change. No other files affected.

