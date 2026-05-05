## Fix mobile gallery alignment

Replace CSS `columns-2` masonry layout with CSS Grid in the gallery section of `src/pages/showcase/BriteShowcase.tsx`.

### Change (line 109)

**Before:**
```
columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4
```
+ each button has `mb-3 sm:mb-4 break-inside-avoid`

**After:**
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4
```
+ each button gets `aspect-[4/5]` (all images are 4:5 ratio), remove `mb-3 sm:mb-4 break-inside-avoid`
+ img gets `object-cover w-full h-full` instead of `w-full h-auto`

This ensures perfect row alignment on all screen sizes since all images share the same 4:5 aspect ratio.
