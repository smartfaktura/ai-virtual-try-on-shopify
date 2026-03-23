

# Show Animated Cards in Modal with Optimized Sizing

## Problem
Currently `modalCompact` disables animations entirely (shows static image). The user wants animated cards in the modal but with smaller/optimized overlays. Also, the modal needs to be wider on desktop, and no visible borders on the card images.

## Changes

### 1. `src/components/app/WorkflowCardCompact.tsx`

**Enable animations for `modalCompact`** — instead of switching to a static image, pass the animated thumbnail with a new `modalCompact` flag so overlays render smaller:

```tsx
// Line 51: Change from blocking animation to enabling it with modalCompact
{scene ? (
  <WorkflowAnimatedThumbnail 
    scene={scene} 
    isActive={isVisible} 
    compact 
    mobileCompact={mobileCompact} 
    modalCompact={modalCompact} 
  />
) : (
  <img ... />
)}
```

**Remove border from card when `modalCompact`** — use `border-0` or `border-none` to eliminate visible borders:
```tsx
className={cn(
  "group overflow-hidden transition-shadow duration-300 flex flex-col",
  modalCompact ? "border-0 shadow-none" : "border hover:shadow-lg"
)}
```

### 2. `src/components/app/WorkflowAnimatedThumbnail.tsx`

**Accept `modalCompact` prop** and treat it similarly to `mobileCompact` for element sizing — use the same genuinely-smaller elements (the `mobileCompact` branch in `FloatingEl`) but for the modal context:

- Props: add `modalCompact?: boolean`
- In `FloatingEl`: when `modalCompact`, use the same small element rendering as `mobileCompact` (smaller cards, smaller avatars, smaller text)
- Pass `modalCompact` through to `FloatingEl` in the render loop
- Background stays `object-cover` (no change)

### 3. `src/components/app/StartWorkflowModal.tsx`

**Widen desktop dialog** from `sm:max-w-[640px]` to `sm:max-w-[720px]`:
```tsx
<DialogContent className="sm:max-w-[720px] rounded-2xl p-0 gap-0 overflow-hidden">
```

### Files
- `src/components/app/WorkflowCardCompact.tsx` — enable animation for `modalCompact`, remove borders
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — accept `modalCompact` prop, use small overlay sizes
- `src/components/app/StartWorkflowModal.tsx` — widen desktop dialog to 720px

