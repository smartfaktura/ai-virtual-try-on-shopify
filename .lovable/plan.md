

## Fix Popover Flash-Close on Mobile

### Root Cause

On mobile, tapping a Radix `PopoverTrigger` produces a sequence of touch/pointer events (touchstart, pointerdown, touchend, pointerup, click). After the popover opens, Radix detects subsequent pointer events as "outside" interactions and immediately closes it. This is a known Radix UI behavior on touch devices.

### Solution

Add `modal` prop to each `Popover` component used in the chip selectors. When `modal={true}`, Radix creates a dismiss layer that properly manages focus and prevents the "pointer down outside" detection from firing prematurely. This is the standard Radix solution for touch-device popover issues.

### Files to Change

**1. `src/components/app/freestyle/ModelSelectorChip.tsx` (line 47)**

Change `<Popover open={open} onOpenChange={onOpenChange}>` to `<Popover open={open} onOpenChange={onOpenChange} modal>`.

**2. `src/components/app/freestyle/SceneSelectorChip.tsx` (line 45)**

Same change: add `modal` prop.

**3. `src/components/app/freestyle/ProductSelectorChip.tsx` (line 31)**

Same change: add `modal` prop.

**4. `src/components/app/FramingSelectorChip.tsx`**

Same change: add `modal` prop to the Popover.

### What `modal` Does

- Prevents pointer events outside the popover from closing it prematurely
- Adds a transparent backdrop that catches outside clicks properly
- Traps focus inside the popover (good for accessibility)
- Pressing Escape or tapping the backdrop still closes it correctly

### No Other Changes Needed

This is a one-word fix (`modal`) on 4 files. No layout, styling, or structural changes required.

