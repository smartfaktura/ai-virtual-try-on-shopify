
## Optimize Creative Drop Wizard Mobile Experience

Three issues identified from the screenshot and user feedback:

### 1. Scroll-to-top after clicking Next
When navigating between steps, the page doesn't scroll back to the top, making it hard to see the new step content and find the Next button. The `handleNext` function will be updated to scroll to the top of the wizard after changing steps.

### 2. Next button overlapping with customer support icon
The footer with Back/Next buttons sits at the bottom of the content flow. On mobile, it can overlap with floating support widgets. The footer will be made sticky on mobile with proper bottom padding to clear any floating icons.

### 3. Product selection grid has inner scroll on mobile
The product grid (Step 2) uses `max-h-[320px] overflow-y-auto` which creates a nested scrollable area -- awkward on mobile. On mobile, this constraint will be removed so products flow naturally within the page scroll.

---

### Technical Details

**File: `src/components/app/CreativeDropWizard.tsx`**

**Change 1 -- Scroll to top on step change (line 283-290):**
Add `window.scrollTo({ top: 0, behavior: 'smooth' })` inside `handleNext` after `setStep`, and also in the Back button's `onClick`.

**Change 2 -- Sticky footer on mobile (line 1441):**
Update the footer div to use sticky positioning on mobile:
```
className="pt-4 border-t space-y-2 sticky bottom-0 bg-background pb-safe z-10 sm:static sm:pb-0"
```

**Change 3 -- Remove inner scroll on product grid for mobile (line 593):**
Change `max-h-[320px] overflow-y-auto` to only apply on desktop:
```
className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:max-h-[320px] sm:overflow-y-auto pr-1"
```

**Change 4 -- Add bottom padding to content area for sticky footer (line 469):**
Add mobile bottom padding to content container so the sticky footer doesn't cover content:
```
className="py-8 pb-24 sm:pb-8"
```
