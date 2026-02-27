

## Fix Interior Design Workflow: Rename + Fix Wizard Flow

### Problems
1. Workflow is called "Interior Design Set" -- should be renamed to **"Interior / Exterior Staging"** (or similar) to cover both use cases
2. The first step shows "From Product(s)" and "From Scratch" selectors -- this makes no sense for interior design. Users should only be able to **upload an image** (no product selection)
3. Missing **Interior vs Exterior** type selector so users can specify what they're staging

### Changes

#### 1. Database Migration -- Rename Workflow
- Rename from `Interior Design Set` to `Interior / Exterior Staging`
- Update description accordingly

#### 2. `src/pages/Generate.tsx` -- Fix Wizard Flow
- Update detection: `isInteriorDesign` matches new name `'Interior / Exterior Staging'`
- **Skip the source step entirely** for interior design -- go straight to `'upload'` step since product selection doesn't apply
- Add new state: `interiorType` with values `'interior'` | `'exterior'`
- Update wizard steps to: `['Upload Photo', 'Type & Room', 'Styles', 'Results']`
- In the **upload step**, update copy to say "Upload a photo of a room or building exterior"
- In the **settings step**, add an **Interior / Exterior toggle** at the top of Room Settings:
  - When "Interior" is selected: show the full room type dropdown (Living Room, Kitchen, etc.)
  - When "Exterior" is selected: show exterior-specific types (Front Facade, Backyard, Garden, Pool Area, Driveway, Rooftop Terrace, Entrance/Porch)
- Pass `interior_type` (interior/exterior) to the generation payload
- When workflow loads (`useEffect`), auto-set `currentStep` to `'upload'` instead of `'source'`

#### 3. `src/components/app/WorkflowCard.tsx` -- Update Feature List
- Update the `featureMap` key from `'Interior Design Set'` to `'Interior / Exterior Staging'`

#### 4. `supabase/functions/generate-workflow/index.ts` -- Handle Exterior Type
- Add exterior room type descriptions to `ROOM_TYPE_DESCRIPTIONS`
- Read `interior_type` from payload and adjust prompt accordingly (exterior shots focus on curb appeal, landscaping, architecture preservation)

### Technical Details

**Auto-skip to upload step for interior workflow:**
```typescript
useEffect(() => {
  if (isInteriorDesign) {
    setSourceType('scratch');
    setCurrentStep('upload');
  }
}, [isInteriorDesign]);
```

**Interior/Exterior toggle in settings:**
```text
[Interior] [Exterior]  <-- two-button toggle

Interior selected -> Room types: Living Room, Kitchen, etc.
Exterior selected -> Room types: Front Facade, Backyard, Garden, Pool Area, etc.
```

### Files to Edit

| File | Change |
|------|--------|
| SQL Migration | Rename workflow to "Interior / Exterior Staging", update description |
| `src/pages/Generate.tsx` | Auto-skip to upload, add interior/exterior toggle, update room types, pass interior_type |
| `src/components/app/WorkflowCard.tsx` | Update featureMap key |
| `supabase/functions/generate-workflow/index.ts` | Add exterior room descriptions, handle interior_type |

