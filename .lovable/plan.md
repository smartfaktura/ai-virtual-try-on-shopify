
## Dashboard personalization reset (clean + single-choice)

### What I’ll change

1. **Make dashboard selector single-choice only (no multi-select UI)**
   - Update `src/components/app/DashboardPersonalizationHero.tsx` to remove:
     - multi-select toggling logic
     - checkbox-style multi rows
     - `Save preferences` button in the dropdown/sheet
   - Replace with **one-tap selection**:
     - user clicks one category
     - dropdown closes immediately
     - hero text updates instantly

2. **Stop showing “Category A & Category B” in dashboard**
   - Update category helper logic in `src/lib/categoryConstants.ts` so dashboard always resolves to **one primary category**:
     - if `any` exists → show **All products**
     - otherwise use first valid category
   - Remove two-category and three-category display behavior from dashboard label/headline logic.

3. **Match existing VOVV dashboard typography/style (remove “Apple-ish” feel)**
   - In `DashboardPersonalizationHero`, revert to brand-consistent text rhythm:
     - no uppercase micro-label styling
     - no extra-light “whisper” headline treatment
     - use standard dashboard font weights/sizing/colors
   - Keep pill and dropdown minimal, but closer to existing VOVV components.

4. **Improve dropdown appearance (clean list, not heavy control panel)**
   - Desktop: simple popover list with one active item + subtle check indicator.
   - Mobile: same list in `MobilePickerSheet`, single-select tap behavior, auto-close.
   - Keep interaction lightweight and fast, with only error toast on failed save (no success spam).

### Scope decisions
- **Dashboard only behavior is simplified to single category.**
- Onboarding/Settings data can still exist as array in storage, but dashboard will use one primary value and persist a single selected category when changed from dashboard.

### Technical details
- Files to edit:
  - `src/components/app/DashboardPersonalizationHero.tsx`
  - `src/lib/categoryConstants.ts`
- No database migration needed (reuse `profiles.product_categories`).
- Persistence model remains `string[]`, but dashboard writes `[selectedCategory]` for clarity and consistency.
