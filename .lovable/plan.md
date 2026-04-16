

## Understanding

The user is right — `/app/pricing` currently shows plan selection rows AND a comparison table = same plans shown twice. For a dedicated pricing/comparison page, the **comparison table IS the primary plan selector**. No need for separate selectable rows above it.

## Goal

Remove the duplicate "compact plan rows" section. Make the **comparison table the hero of plan selection** with:
- Plan names + prices in sticky header columns
- "Recommended for You" badge on Growth column
- A CTA button per plan column at the bottom of the table (and sticky in the header)
- Free user / current plan states reflected in the header

## File
- `src/pages/AppPricing.tsx`

## Changes

### 1. Remove the compact plan rows section entirely
Delete the current selectable row block (radio + plan name + price). Also remove:
- The `selectedPlanId` state
- The single dynamic CTA below the rows
- The "Choose your plan" mini-header

The comparison table replaces all of it.

### 2. Promote the comparison table to be THE plan picker
Restructure `FEATURE_MATRIX` table:
- **Sticky header row** per plan column containing:
  - Plan name (Growth gets "Recommended for You" badge above name)
  - Price `$X/mo` + small annual savings text
  - Credits/month line
  - **CTA button** ("Choose Starter" / "Continue with Growth" / "Current plan" / "Reactivate")
- First column: feature name + category group headers (Generation, Video, etc.)
- Cell values: ✓ / — / text
- Mobile: horizontal scroll wrapper with the first column pinned (sticky left)
- Bottom of table: repeat the CTA row so users don't have to scroll back up

### 3. Hero stays compact (from previous round)
Keep the tightened hero, billing toggle, free-user value strip — all still relevant. Billing toggle moves to sit directly above the comparison table (controls the prices in the table header).

### 4. Trust block placement
Move the "Cancel anytime · No commitment" + lock line to sit directly under the comparison table (below the bottom CTA row), left-aligned to match the table.

### 5. Sticky mobile CTA
Update mobile sticky bar to show the **recommended plan** (Growth) by default with a "Continue" button → opens checkout for Growth. No more "selected plan" tracking needed.

## Out of scope
- ROI snapshot, How credits work, FAQs, Enterprise CTA — unchanged
- Plan data, Stripe wiring, modal — unchanged

## Result

One unified plan section: a premium comparison table where each column is a complete plan (name, price, badge, CTA, feature checkmarks). No duplication. Users compare and pick in one place — exactly how Linear, Notion, Framer, Vercel pricing pages work.

