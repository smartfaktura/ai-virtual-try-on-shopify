

## Refined Product Upload Improvements

Focused, practical improvements to the current upload flow — no new features, just polish.

### 1. Clipboard Paste Support (Cmd+V / Ctrl+V)
Add a paste event listener on the modal so users can paste screenshots or copied images directly. No UI change needed — it just works.

**File**: `src/components/app/ManualProductTab.tsx` — add `useEffect` with paste event listener that calls `addFiles()`

### 2. Larger Primary Image + Compact Secondaries
Currently all thumbnails are the same small size (72-96px). Redesign to show the primary/cover image larger (~140px) and secondary images smaller (~56px) in a strip below.

**File**: `src/components/app/ProductImageGallery.tsx`
- Primary image: 140px square with subtle ring border
- Secondary images: 56px strip with "+" button inline
- Click secondary to promote it to primary (swap animation via CSS transition)
- Remove the "Cover" text label — the size difference makes it obvious

### 3. Smoother AI Auto-Fill Feedback
Replace `<Skeleton>` blocks with a gentle shimmer + fade-in when AI fills fields. Currently it's jarring — skeleton → instant text. Instead: show the input with a pulsing border glow while analyzing, then fade the value in.

**File**: `src/components/app/ManualProductTab.tsx`
- Remove `<Skeleton>` conditionals
- Always render inputs; add `animate-pulse ring-1 ring-primary/30` class while `isAnalyzing`
- Set values normally — the transition feels natural

### 4. Better Drop Zone Animation
When dragging files over the upload area, add a more visible frosted overlay with scale animation instead of just a border color change.

**File**: `src/components/app/ManualProductTab.tsx`
- Drag-active state: scale up slightly, stronger background, animated border

### Summary of Files Changed
- `src/components/app/ManualProductTab.tsx` — paste support, smoother AI shimmer, better drag feedback
- `src/components/app/ProductImageGallery.tsx` — larger primary image layout

