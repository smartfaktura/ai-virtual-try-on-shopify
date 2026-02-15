
## Fix: Clean Mobile Footer for Creative Drop Wizard

### Problem
The sticky footer with Cancel/Next buttons looks bad on mobile -- it has a shadow, border, and sticky positioning that conflicts with the browser chrome and the Lovable preview badge (customer support icon). The "Next" button gets partially covered.

### Note on Customer Support Icon
The green chat bubble visible in the screenshot is the **Lovable preview badge** -- it's injected by the preview environment and is not part of your codebase. It won't appear on your published site (vovvai.lovable.app). No code changes can hide it in preview mode.

### Solution
Remove the sticky footer behavior on mobile entirely. Instead, render the buttons as simple inline content at the bottom of the scrollable area with clean spacing -- no shadow, no sticky, no border on mobile.

---

### Technical Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**1. Replace sticky footer with clean inline buttons on mobile (line 1452)**

Change the footer container from:
```
className="pt-4 border-t space-y-2 sticky bottom-0 bg-background pb-[env(safe-area-inset-bottom,24px)] z-50 sm:static sm:pb-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
```
To:
```
className="pt-6 mt-4 space-y-2 sm:border-t sm:pt-4 sm:mt-0"
```

This removes all sticky behavior, shadow, z-index, and the iOS safe-area padding. On mobile the buttons simply sit at the end of the content with generous top spacing. On desktop (`sm:`), the border-top separator is preserved.

**2. Add bottom margin to the content area to ensure breathing room**

Update the main content bottom padding (around line 469) from `pb-24 sm:pb-8` to `pb-8` since the footer is no longer sticky and doesn't need extra clearance.

This gives a clean, simple layout: users scroll through content and the Back/Next buttons are right there at the bottom -- no overlapping, no fighting with floating icons, no awkward slide-up behavior.
