## Fixes for /showcase/brite

### 1. Rounded corners disappearing on mobile hover/tap
The `group-hover:scale-[1.03]` transform on the `<img>` causes mobile Safari to lose the parent's `overflow-hidden` + `rounded-xl` clipping during the animation.

**Fix** in `BriteShowcase.tsx` line 114: Add `will-change-transform` to the button element so the GPU compositing layer respects the border-radius clip during child transforms.

Change:
```
className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden ..."
```
To:
```
className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform ..."
```

### 2. "OrangeVisual" text merging on mobile
Line 74-76: The `<br className="hidden sm:block" />` is hidden on mobile, causing "Orange" and "Visual" to run together without a space.

**Fix**: Add `{' '}` after "Orange" on line 74 so there's always a space regardless of the `<br>` visibility.

```tsx
Your Brite Blood Orange{' '}
<br className="hidden sm:block" />
Visual Collection
```
