
## Fix WorkflowHeroCard mobile layout

Two issues visible in the screenshot:

### 1. Thumbnail aspect ratio (`src/components/app/WorkflowHeroCard.tsx`)
Change the mobile thumbnail from `aspect-[16/10]` (horizontal) to `aspect-[3/4]` (vertical) so the animated scenes display properly without awkward cropping. Keep `sm:aspect-auto` for desktop.

### 2. Hide duplicate tag pills on mobile
The animated thumbnail already shows "1000+ Scenes" and "Full Control" overlay badges. The tag pills below the description repeat this info. Add `hidden sm:flex` to the pills container so they only show on desktop where the thumbnail is side-by-side.

### 3. Full-width CTA on mobile
Make the "Start Creating" button `w-full sm:w-auto` so it spans the card width on mobile.

### File changed
- `src/components/app/WorkflowHeroCard.tsx`
