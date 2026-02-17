

## Fix Credit Indicator, Update Video Pricing, and Add Video Generation to Plans

### 1. Fix Credit Indicator Display

The current CreditIndicator already shows credits on a single card with balance, quota, and progress bar. The visual issue is that the progress bar color is too subtle (`bg-sidebar-foreground/30`). Will improve contrast and keep the clean single-line layout as shown in the screenshot.

### 2. Update Video Generation Pricing Logic

New video credit costs based on model and duration:

| Model | 5 seconds | 10 seconds |
|-------|-----------|------------|
| V2.1 (kling-v2-1) | 90 credits | 180 credits |
| V1.6 (kling-v1-6) | 70 credits | 140 credits |

Currently `calculateCost` in CreditContext returns `count * 30` for video mode. This will be updated to accept `modelName` and `duration` parameters and apply the new pricing.

### 3. Add Video Generation Feature to Plan Cards

Currently only the Pro plan lists "Video Generation" as a feature. Per the request, Starter, Growth, and Pro plans should all showcase Video Generation. Free plan stays without it.

Updated features:
- **Starter**: Add "Video Generation" to features list
- **Growth**: Add "Video Generation" to features list  
- **Pro**: Already has it

### Files Modified

**`src/contexts/CreditContext.tsx`**
- Update `calculateCost` to accept optional `modelName` and `duration` params
- V2.1 model: 90 credits for 5s, 180 for 10s
- V1.6 model: 70 credits for 5s, 140 for 10s
- Default (no model specified): 90 credits for 5s

**`src/components/app/CreditIndicator.tsx`**
- Improve progress bar visibility (better contrast color)
- Keep single-line layout as-is

**`src/pages/VideoGenerate.tsx`**
- Show dynamic credit cost on the Generate button based on selected model and duration
- Import and use `useCredits().calculateCost` to display cost

**`src/data/mockData.ts`**
- Add "Video Generation" to Starter and Growth plan features lists

**`src/types/index.ts`**
- No changes needed -- GenerationMode already includes 'video'

### Technical Details

The `calculateCost` function signature will expand:

```text
calculateCost({
  count: 1,
  quality: 'standard',
  mode: 'video',
  modelName: 'kling-v2-1',  // new
  duration: '10',            // new
}) => 180
```

The Generate Video button will show the cost dynamically:

```text
Generate Video · 90 credits    (V2.1, 5s)
Generate Video · 180 credits   (V2.1, 10s)
Generate Video · 70 credits    (V1.6, 5s)
Generate Video · 140 credits   (V1.6, 10s)
```
