

## Library Redesign + Admin "Add as Model/Scene" from Library

Three things to implement:

---

### 1. Admin "Add as Model" and "Add as Scene" buttons on Library image cards

The Library page (`Jobs.tsx`) shows all user-generated images. Currently, admin actions (Add as Scene, Add as Model) only exist in the Freestyle Studio gallery. We need to add these same actions to Library image cards so an admin can promote any generated image.

**Changes to `LibraryImageCard.tsx`:**
- Import `useIsAdmin` hook
- Import `AddSceneModal` and `AddModelModal` components
- Add state for `sceneModalUrl` and `modelModalUrl`
- In the hover overlay action buttons area, when `isAdmin` is true, show Camera icon (Add as Scene) and User icon (Add as Model) buttons
- Render the modals at the bottom of the component

---

### 2. Custom scenes usable in Freestyle/Virtual Try-On

Custom scenes added via "Add as Scene" are already stored in `custom_scenes` table and already merged into the scene selector (`SceneSelectorChip.tsx` line 38: `const allPoses = [...mockTryOnPoses, ...customPoses]`). This is already working -- custom scenes appear in the Scene selector for all users. No changes needed here.

---

### 3. Library page UI redesign to match Discover

Replace the current old-school Library layout (PageHeader wrapper, separate tabs bar, grid/list toggle, select dropdown) with a modern Discover-like design:

**Changes to `Jobs.tsx`:**
- Remove `PageHeader` wrapper -- use inline heading like Discover (`text-3xl font-semibold tracking-tight`)
- Remove grid/list toggle (keep only masonry grid like Discover)
- Replace `Tabs` component with Discover-style pill buttons (rounded-full, `bg-foreground text-background` when active)
- Replace `Select` dropdown for sorting with inline pill buttons ("Newest" / "Oldest")
- Replace `Input` search with Discover-style search bar (taller, rounded-2xl, `bg-muted/30`)
- Use same masonry column layout as Discover: `columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1`
- Update skeleton loading to match Discover (centered `Loader2` spinner)
- Update empty state to match Discover style (centered with `Compass`-like icon)

**Changes to `LibraryImageCard.tsx`:**
- Match `DiscoverCard` visual style: remove `mb-4` spacing (use `mb-1` like Discover), remove explicit border, use `rounded-lg` instead of `rounded-2xl`
- Add image shimmer/loading state like DiscoverCard
- Keep hover overlay with gradient, badge, prompt preview, date, and action buttons
- Add admin buttons (Scene/Model) to the hover overlay
- Render AddSceneModal / AddModelModal portals

**Result:** The Library page will look and feel identical to Discover, but scoped to the user's own generations, with admin promotion actions available on hover.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Jobs.tsx` | Full UI redesign: remove PageHeader, Tabs, Select, grid/list toggle. Use Discover-style pills, search, masonry grid |
| `src/components/app/LibraryImageCard.tsx` | Restyle to match DiscoverCard. Add admin "Add as Scene" and "Add as Model" buttons with modal triggers |

### Technical Details

**Library card with admin actions:**
```tsx
// In LibraryImageCard hover overlay actions
{isAdmin && (
  <>
    <button onClick={() => setSceneModalUrl(item.imageUrl)} title="Add as Scene">
      <Camera className="w-3.5 h-3.5" />
    </button>
    <button onClick={() => setModelModalUrl(item.imageUrl)} title="Add as Model">
      <User className="w-3.5 h-3.5" />
    </button>
  </>
)}
```

**Discover-style filter pills (replacing Tabs):**
```tsx
const TABS = [
  { id: 'all', label: 'All', icon: Image },
  { id: 'generations', label: 'Generations', icon: Camera },
  { id: 'freestyle', label: 'Freestyle', icon: Sparkles },
];

// Rendered as:
<div className="flex flex-wrap gap-2">
  {TABS.map(t => (
    <button
      key={t.id}
      onClick={() => setTab(t.id)}
      className={cn(
        'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
        tab === t.id
          ? 'bg-foreground text-background shadow-sm'
          : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
      )}
    >
      <t.icon className="w-3.5 h-3.5 inline mr-1.5" /> {t.label}
    </button>
  ))}
</div>
```

**Masonry grid (matching Discover):**
```tsx
<div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1">
  {displayItems.map(item => (
    <LibraryImageCard key={item.id} item={item} />
  ))}
</div>
```
