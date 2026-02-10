

## View Counts, Full-Screen Fix, Clean X Button, Scene Applied Tooltip

### 1. Add View Counts for Items

Since there's no view tracking table yet, we need to create one.

**Database migration:**
- Create `discover_item_views` table with columns: `id` (uuid), `item_type` (text), `item_id` (text), `user_id` (uuid, nullable), `created_at` (timestamptz)
- Create a database function `get_discover_view_counts(item_ids text[])` that returns aggregated counts per item_id
- RLS: allow anonymous inserts (tracking views), allow select for all

**Frontend changes:**
- In `src/pages/Discover.tsx`: when `selectedItem` changes (modal opens), insert a view record via Supabase
- Create a simple hook or inline query to fetch view counts for items shown in the modal
- In `src/components/app/DiscoverDetailModal.tsx`: display view count as a subtle metadata line near the category/title area (e.g., "142 views" in small muted text next to the category label)

### 2. Fix Modal Not Being Full Screen

From the screenshot, there's a visible gap at the top where the app header/navigation shows through. The modal overlay needs to truly cover the entire viewport.

**Changes to `src/components/app/DiscoverDetailModal.tsx`:**
- Ensure the overlay uses `fixed inset-0 z-[100]` (higher z-index to sit above the sidebar/header which is likely z-50)
- Remove any padding or margin from the outer container that could cause the gap at top
- The split layout container should also be `h-screen` / `h-dvh` to ensure full viewport coverage on mobile

### 3. Replace Circle X with Plain X Button

Remove the rounded-full circle background from the close button. Make it a simple, high-contrast X.

**Changes to `src/components/app/DiscoverDetailModal.tsx`:**
- Change close button from `rounded-full bg-black/70 w-11 h-11` to a simple `w-8 h-8` button with no background circle
- Keep `text-white` and large stroke weight for visibility against the dark backdrop
- Add `hover:opacity-70` for subtle interaction feedback
- No background, no circle -- just a clean X icon

### 4. Scene Applied Animation in Freestyle

When a user clicks "Use Scene" and navigates to Freestyle, show a brief tooltip/animation near the scene selector chip to confirm the scene was applied.

**Changes to `src/pages/Freestyle.tsx`:**
- Add a `showSceneAppliedHint` state that activates when a scene is loaded from URL params
- Check `localStorage` for a `hideSceneAppliedHint` flag -- if set, skip the animation
- When active, render a small animated tooltip/badge near the SceneSelectorChip that says "Scene applied!" with a subtle fade-in + slide animation
- Include a small "Don't show again" link/button that sets the localStorage flag and dismisses
- Auto-dismiss after 4 seconds

**Changes to `src/components/app/freestyle/FreestyleSettingsChips.tsx`:**
- Accept a `showSceneHint` prop to position the tooltip near the scene chip
- Or handle it directly in Freestyle.tsx with absolute positioning relative to the scene chip area

---

### Files to Modify

| File | Changes |
|------|---------|
| Database | New `discover_item_views` table + RLS policies |
| `src/pages/Discover.tsx` | Insert view record when modal opens, fetch/pass view count to modal |
| `src/components/app/DiscoverDetailModal.tsx` | Show view count, fix z-index to z-[100], remove circle from X button, ensure full-screen coverage |
| `src/pages/Freestyle.tsx` | Add scene-applied hint state with localStorage persistence, auto-dismiss tooltip |

### Technical Details

**View count insert (Discover.tsx):**
```typescript
useEffect(() => {
  if (selectedItem) {
    supabase.from('discover_item_views').insert({
      item_type: selectedItem.type,
      item_id: getItemId(selectedItem),
    });
  }
}, [selectedItem]);
```

**View count display (modal):** Pass `viewCount` as a prop. Show as `{viewCount} views` in `text-[11px] text-muted-foreground/50` next to the category label.

**Close button (no circle):**
```tsx
<button onClick={onClose} className="absolute top-5 right-5 z-20 text-white/80 hover:text-white transition-opacity">
  <X className="w-7 h-7" strokeWidth={2} />
</button>
```

**Scene applied tooltip (Freestyle.tsx):**
- State: `const [showSceneHint, setShowSceneHint] = useState(false)`
- In the URL params effect, after setting the scene: `if (!localStorage.getItem('hideSceneHint')) setShowSceneHint(true)`
- Auto-dismiss: `useEffect` with `setTimeout(() => setShowSceneHint(false), 4000)`
- Render a small floating div near the scene area with "Scene applied!" text, fade-in animation, and a "Don't show again" button that calls `localStorage.setItem('hideSceneHint', 'true')`

