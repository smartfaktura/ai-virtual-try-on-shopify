

# Fix Background Selector — Deselection, X Buttons, Saved Colors

## Problems
1. **Cannot deselect Custom Color** — clicking the card always opens the native picker and re-selects it
2. **Cannot deselect Custom Gradient** — same issue, always opens picker
3. No visual way to remove/deselect custom selections (no X button)
4. User wants ability to save custom colors for reuse

## Changes

### File: `ProductImagesStep3Refine.tsx`

**1. Fix deselection logic for Custom Color and Gradient cards**
- Split the click handler: if already selected, deselect (toggle off) without opening picker
- Add a separate small pencil/edit icon button on active custom cards to re-open the picker
- Add an X button (top-left) on active custom/gradient cards to deselect and clear

**2. Add X button on ALL active swatch cards**
- When any swatch card is selected, show a small X icon (top-left) that deselects it on click (stops propagation so it doesn't re-select)
- This gives a universal "remove" affordance across all backgrounds

**3. Save custom colors per user (database)**
- Create a `user_saved_colors` table: `id`, `user_id`, `hex`, `gradient_from`, `gradient_to`, `label`, `created_at`
- Limit to 6 saved colors per user
- When a user picks a custom color/gradient, show a small "save" heart/bookmark icon on the card
- Saved colors appear as additional cards in the grid (after presets, before the + cards)
- Each saved card has an X to delete it from saved colors

**4. UI polish**
- Active custom cards: show the fill + checkmark (top-right) + X (top-left) + small edit pencil icon
- Inactive custom cards: dashed border + Plus icon (unchanged)
- Saved color cards: same style as presets but with a small bookmark indicator and X to delete

### Database migration
```sql
CREATE TABLE public.user_saved_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hex text,
  gradient_from text,
  gradient_to text,
  label text DEFAULT 'Custom',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT max_colors CHECK (true)
);

ALTER TABLE public.user_saved_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own colors"
  ON public.user_saved_colors FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Enforce 6-color limit client-side (disable save button when at limit).

### New hook: `useUserSavedColors.ts`
- Fetch saved colors for current user
- `saveColor(hex)` / `saveGradient(from, to)` — insert with limit check
- `deleteColor(id)` — delete by id
- Uses `useQuery` + `useMutation` with Supabase

### Updated `BackgroundSwatchSelector` logic

```text
Grid layout:
[Preset 1-6]
[Preset 7-12]
[Saved 1] [Saved 2] ... [+ Color] [+ Gradient]

Card states:
- Inactive preset: ring-1, no badge
- Active preset: ring-2 primary, checkmark (top-right), X (top-left)
- Inactive custom: dashed border, + icon
- Active custom: fill shown, checkmark, X (top-left), edit pencil (bottom-right corner)
- Saved color: solid fill, small bookmark icon, X to delete
```

**Click behavior:**
- Preset card click → toggle selection
- Custom card click (inactive) → select + open picker
- Custom card click (active) → do nothing (use edit icon to change, X to remove)
- X button click → deselect/remove (stopPropagation)
- Edit icon click → open native picker (stopPropagation)

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Fix click handlers, add X/edit buttons on active cards, integrate saved colors |
| `src/hooks/useUserSavedColors.ts` | New hook for CRUD on saved colors |
| Migration | Create `user_saved_colors` table with RLS |

