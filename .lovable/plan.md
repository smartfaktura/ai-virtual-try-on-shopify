## Use standard `<PageHeader>` on `/app/generate/product-images`, dynamic per step

Match the rest of the `/app/*` pages (Discover, Brand Models, Brand Profiles, etc.) which wrap their content in `<PageHeader title subtitle>`. Right now Product Visuals uses small inline H2s above the stepper — they should be promoted to the big standard header and change per step.

### Changes

**`src/pages/ProductImages.tsx`**

1. Add per-step title + subtitle map:
   | Step | Title | Subtitle |
   |------|-------|----------|
   | 1 | Select products | Choose one or more products to start generating visuals |
   | 2 | Select shots | Pick the shots you want to generate for your products |
   | 3 | Complete setup | Only a few choices are needed for selected shots |
   | 4 | Review & generate | A few last details left to fill |
   | 6 | (omit header — generating screen unchanged) | |

2. Wrap the wizard return (currently the outer `<div className="space-y-6 …">` from ~line 1368) in `<PageHeader title={titleForStep} subtitle={subtitleForStep}>…</PageHeader>` when `step <= 4`. Keep step 6 (generating) rendered without the PageHeader, same as today.

3. Remove the small inline H2 blocks that currently sit above the stepper content:
   - Step 1 header `<h2>Select products</h2>` (~lines 1390-1393) — delete
   - `ProductImagesStep2Scenes` internal H2 "Select shots" + subtitle — delete (or keep header only inside that component if it's reused; otherwise drop)
   - `ProductImagesStep3Setup` internal H2 "Complete setup" + subtitle — delete
   - `ProductImagesStep4Review` internal H2 "Review & generate" + subtitle — delete

   Each step component keeps all its other UI; only the title/subtitle pair moves to the page-level `<PageHeader>`.

4. Keep `<SEOHead>` exactly as-is (browser tab title unchanged).

### Result

Header on Product Visuals now matches Discover / Brand Models / Products visually (large `text-2xl sm:text-3xl font-bold` title + muted subtitle), and the title+subtitle change as the user moves Product → Shots → Setup → Generate.

No logic, data, or copy changes outside title/subtitle relocation.
