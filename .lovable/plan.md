

## Fix Creative Drop Wizard Mobile Experience

Comprehensive mobile fixes across all 5 wizard steps to eliminate zoom issues, remove nested scroll areas, and improve touch targets.

### Problems Identified

1. **iOS auto-zoom on text inputs** -- Input fields use font-size 14px (`text-sm`), which triggers Safari to zoom in when focused. Users can't easily zoom back out.
2. **Nested scroll areas** -- Scenes, Models, and Poses grids all have `max-h-[200px] overflow-y-auto`, creating awkward scroll-within-scroll on mobile.
3. **Aspect ratio buttons cramped** -- 4 buttons in a single row overflow on small screens.
4. **Model avatar grid too dense** -- `grid-cols-4` makes touch targets too small on mobile.
5. **Sticky footer missing safe-area inset** -- Bottom of footer can be hidden behind iOS home indicator bar.

---

### Technical Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**1. Fix iOS zoom -- ensure all inputs use 16px font on mobile**

- Line 482 (Schedule Name input): Add `text-base` class (already has it implicitly via Input component which uses `text-base md:text-sm` -- verify this is working)
- Line 537 (Special Instructions textarea): Ensure `text-base` is added
- Line 564 (Product search input): Already uses Input component -- OK
- Line 1055 (Freestyle prompt input): Change `text-sm` to `text-base sm:text-sm`
- Line 1213 (Custom amount input): Ensure base sizing
- Line 1219 (Custom amount input): Already uses Input -- OK

**2. Remove inner scroll on Scenes grid for mobile (line 775)**

Change:
```
className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1"
```
To:
```
className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:max-h-[200px] sm:overflow-y-auto pr-1"
```

**3. Remove inner scroll on Poses grid for mobile (line 846)**

Same pattern -- change `max-h-[200px] overflow-y-auto` to `sm:max-h-[200px] sm:overflow-y-auto`.

**4. Remove inner scroll on Models grid for mobile (line 920)**

Change:
```
className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto pr-1"
```
To:
```
className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:max-h-[200px] sm:overflow-y-auto pr-1"
```
Also reduce from `grid-cols-4` to `grid-cols-3` on mobile for larger touch targets.

**5. Make aspect ratio buttons wrap on mobile (line 712-735)**

Wrap the format buttons container in a `flex flex-wrap gap-2` instead of inline `flex items-center gap-2` so they wrap on narrow screens.

**6. Add safe-area bottom padding to sticky footer (line 1442)**

Change:
```
className="pt-4 border-t space-y-2 sticky bottom-0 bg-background pb-6 z-10 sm:static sm:pb-0"
```
To:
```
className="pt-4 border-t space-y-2 sticky bottom-0 bg-background pb-8 z-10 sm:static sm:pb-0"
```
Increase `pb-6` to `pb-8` for more clearance from iOS browser chrome and support icon.

All changes are in a single file with no new dependencies.
