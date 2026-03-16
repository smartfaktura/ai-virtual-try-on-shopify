

## Fix: Hide Freestyle empty-state placeholder on mobile

### Problem
On mobile, when the wizard guide is showing for new users, the empty-state placeholder (Sparkles icon + "Freestyle Studio" title + description text) overlaps with the guide and takes up valuable screen space. The guide itself already explains what to do, making the placeholder redundant.

### Change

**`src/pages/Freestyle.tsx`** (lines 699-711) — Hide the entire empty-state block on mobile:

- Wrap the empty-state `div` (icon + "Freestyle Studio" + description) with a `hidden md:flex` class so it only shows on tablet/desktop
- This prevents visual overlap with the FreestyleGuide wizard on mobile screens
- The guide widget alone provides sufficient onboarding context on small screens

Single-line change: update line 700 from:
```
<div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
```
to:
```
<div className="hidden md:flex flex-col items-center justify-center h-full px-4 sm:px-6">
```

