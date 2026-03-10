

## Where to Add More Feedback Touchpoints

Currently the `FeedbackBanner` only appears on **Dashboard** and **Settings**. Here are the high-value placements ranked by user engagement opportunity:

### Recommended Placements

1. **Library / Jobs page** (`src/pages/Jobs.tsx`) — Users reviewing generated results are primed to share quality feedback. Place at the bottom of the page.

2. **Products page** (`src/pages/Products.tsx`) — After users have uploaded products, they have context on the upload experience. Place at the bottom.

3. **Freestyle page** (`src/pages/Freestyle.tsx`) — Creative users experimenting with prompts are a great source of feature requests. Place at the bottom.

4. **Generate page** (`src/pages/Generate.tsx`) — Core workflow page where users hit friction points. Place at the bottom.

5. **Creative Drops page** (`src/pages/CreativeDrops.tsx`) — Users exploring drops may have ideas for new templates or improvements. Place at the bottom.

### Implementation

For each page, the change is identical — import and render `<FeedbackBanner />` as the last element before the closing wrapper div:

```tsx
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
// ... at the bottom of the page content:
<FeedbackBanner />
```

No other changes needed — the component is self-contained (handles auth check, session dismissal, page URL tracking).

### Note

Avoid adding it to every single page (e.g. Brand Profiles, Workflows, Video, Bulk Generate) to prevent feedback fatigue. The five pages above cover the main user journeys: **browse results → manage products → create content**.

