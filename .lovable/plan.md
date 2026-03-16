

## Fix sticky bottom bar not sticking in Virtual Try-On steps

### Root cause
When we switched from `fixed` to `sticky bottom-4`, we also removed the `pb-20` bottom padding from the step wrapper divs. Without that padding, there isn't enough scroll room below the sticky bar for it to actually "stick" — it just sits inline at the bottom of the content.

CSS `sticky bottom-4` means: "stick to 1rem from the bottom of the scroll viewport while there is still content below me to scroll through." With no padding below, the element reaches the bottom of its container at the same moment it reaches the viewport bottom — so it never visibly "sticks."

### Fix

**File: `src/pages/Generate.tsx`**

1. **Add `pb-20` back** to both step wrapper divs:
   - Model step (~line 2865): change `<div className="space-y-4">` → `<div className="space-y-4 pb-20">`
   - Scene step (~line 2908): change `<div className="space-y-4">` → `<div className="space-y-4 pb-20">`

The extra bottom padding gives the scroll container room to scroll past the sticky bar's natural position, allowing it to "float" above the bottom as intended — matching how Perspectives works (that page has enough natural content height below its sticky bar).

