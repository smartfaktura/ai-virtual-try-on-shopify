

## Polish Buy Credits Modal — Premium VOVV.AI Design

### Current Issues
1. Plan cards feel cramped — too much information packed into small columns
2. "MOST POPULAR" badge overlaps card content awkwardly
3. "Current" badge + "Cancel" text crowd the Growth header
4. Credits line "1,500 credits — ~375 images" is hard to scan — too many numbers on one line
5. Feature checkmarks all look identical — no visual hierarchy
6. Free plan takes equal visual weight as paid plans (wastes space)
7. Image estimate uses credits/4 but user confirmed 500 credits = ~100 images (credits/5 ratio, not /4)
8. Top-up tab description text is plain and forgettable

### Design Direction
Clean, airy, branded. Inspired by the warm stone palette and luxury restraint of the rest of VOVV.AI. Focus on making the recommended plan (Growth) feel like the obvious choice without gimmicks.

### Changes

#### 1. Fix Image Estimate Ratio
- Change from `credits / 4` to `credits / 5` to match user's confirmed ratio (500 credits = ~100 images)
- Free: 20 credits = ~4 images
- Starter: 500 credits = ~100 images
- Growth: 1,500 credits = ~300 images
- Pro: 4,500 credits = ~900 images

#### 2. Plan Cards — Cleaner Layout
- Increase card padding from `p-4` to `p-5`
- Plan name: `text-base font-semibold` (larger, clearer)
- Price: `text-3xl font-bold` with `/mo` in smaller muted text
- Credits line simplified: just "~100 images/mo" as the hero metric (drop the raw credit count from the visible line — it's noise)
- Below price, show credits in subtle small text: "500 credits/mo"
- Features: max 3 items (not 4), with slightly more spacing (`space-y-2`)
- Remove the dashed border style on current plan — use a subtle solid border with a "Current" text label instead

#### 3. Growth Card — Subtle Emphasis
- Keep `border-primary ring-1 ring-primary/10` but remove `shadow-md` (too heavy)
- Move "Most Popular" badge inside the card as a small inline badge next to the plan name (not floating above — avoids overlap)
- This eliminates the awkward floating badge positioning entirely

#### 4. CTA Buttons — Cleaner
- All buttons: `rounded-xl min-h-[44px]` (premium touch target)
- Growth: `variant="default"` (filled primary)
- Pro: `variant="default"` (filled primary)  
- Free/Starter below current plan: `variant="outline"`
- Current plan button: show as `variant="secondary"` with "Current Plan" text, disabled

#### 5. Top-Up Tab — Refined
- Remove the `≈ X images · X.X¢/credit` dense line
- Replace with clean two lines: price prominent, then "~X images" below
- Simpler CTA: "Buy" instead of "Purchase"

#### 6. Billing Toggle — Tighten
- Keep centered, keep SAVE 17% badge
- Make the toggle slightly larger for easier clicking: `px-6 py-2 text-sm`

#### 7. Bottom Row — Simplify
- Remove "Need more? Contact Sales" icon clutter — just plain text link
- Keep "Compare all plans" link

#### 8. Update mockData Features
Trim features to 3 per plan for the modal (keeping data at 5 for settings page):
- The modal will `.slice(0, 3)` instead of `.slice(0, 4)`

### Technical Summary

| File | Changes |
|---|---|
| `src/components/app/BuyCreditsModal.tsx` | Fix image ratio to /5, move "Most Popular" badge inline, increase card padding, simplify credits display to "~X images/mo" hero line, show raw credits as subtle subtitle, 3 features max, cleaner CTAs with 44px height, remove dashed current-plan border, tighten top-up cards |
| `src/data/mockData.ts` | Update feature text: change "~50 images/mo" to remove from features (now shown programmatically), keep remaining features clean |
