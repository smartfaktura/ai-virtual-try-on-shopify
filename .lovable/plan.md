

## Creative Drops -- UI Gap Fixes and Polish

### Issues Found

**1. Theme cards use off-brand colors (your main complaint)**
When selecting a theme (Spring, Summer, Holiday, etc.), each gets its own colored background (green, amber, red, pink, indigo). This breaks the VOVV.AI brand identity which uses a consistent dark navy/Control Blue palette. The same off-brand colors also appear in the `DropCard` schedule badges via `themeColors`.

**Fix:** Replace all theme-specific color tints with the brand's primary color system. Selected themes will use `border-primary bg-primary/5 text-foreground` uniformly. Theme badges on schedule cards will also use the brand palette (outline style, no colored backgrounds).

---

**2. `section-label` CSS class is undefined**
The wizard uses `className="section-label"` for headers like "SCHEDULE NAME", "THEME", "BRAND PROFILE" -- but this class doesn't exist in `index.css`. The styling works only because the text happens to render, but it lacks the intended uppercase, tracking-wide, small font styling.

**Fix:** Add a `.section-label` utility class to `index.css`: `text-xs font-semibold uppercase tracking-widest text-muted-foreground`.

---

**3. `animate-fade-in` CSS class is undefined**
Each step uses `className="animate-fade-in"` for transitions, but this animation isn't defined in either `tailwind.config.ts` or `index.css`.

**Fix:** Add a `fade-in` keyframe and `animate-fade-in` animation to `tailwind.config.ts`.

---

**4. No "Select All" / "Clear" helper for product selection**
When users have many products, there's no quick way to select or deselect all. The badge shows count but offers no action.

**Fix:** Add "Select All" and "Clear" buttons next to the selection count badge in Step 2.

---

**5. Schedule cards lack edit/delete actions**
`DropCard` for schedules only has a pause/play toggle. Users cannot edit or delete a schedule after creation.

**Fix:** Add a dropdown menu (three-dot icon) on each schedule card with "Edit" (placeholder -- navigates to wizard pre-filled, future work) and "Delete" (with confirmation dialog) options.

---

**6. Calendar view is static -- no month navigation**
The calendar only shows the current month with no way to browse past or future months.

**Fix:** Add previous/next month navigation arrows to the calendar header.

---

**7. Empty Brand Profile dropdown has no guidance**
If user has no brand profiles, the dropdown shows options but no way to create one.

**Fix:** Add a subtle "No profiles yet" empty state with a link to `/app/brand-profiles`.

---

**8. Review step doesn't show selected product names/thumbnails**
Step 5 only shows "X selected" for products with no visual preview of what was chosen.

**Fix:** Add a row of small product thumbnails (up to 6, with +N overflow) in the review step.

---

### Technical Details

**Files modified:**

| File | Changes |
|------|---------|
| `src/components/app/CreativeDropWizard.tsx` | Remove per-theme color classes from THEMES array; use uniform brand selection styling; add Select All/Clear buttons; add product thumbnail preview to review step; add brand profile empty state link |
| `src/components/app/DropCard.tsx` | Remove `themeColors` map; use brand-consistent badge styling for theme badges on schedule cards; add delete mutation and three-dot dropdown menu |
| `src/pages/CreativeDrops.tsx` | Add month navigation state and arrows to CalendarView |
| `src/index.css` | Add `.section-label` utility class |
| `tailwind.config.ts` | Add `fade-in` keyframe and `animate-fade-in` animation |

**Theme styling change (before/after):**

Before -- each theme gets its own color:
```
{ id: 'spring', color: 'text-green-600 bg-green-50 border-green-200' }
{ id: 'holiday', color: 'text-red-600 bg-red-50 border-red-200' }
```

After -- all themes use brand primary:
```
// Selected state for all themes:
'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
// Unselected:
'border-border hover:border-primary/30 bg-card'
```

**Delete schedule mutation:**
```typescript
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('creative_schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
    toast.success('Schedule deleted');
  },
});
```

**Calendar navigation:**
```typescript
const [monthOffset, setMonthOffset] = useState(0);
const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
// Add ChevronLeft/ChevronRight buttons to header
```
