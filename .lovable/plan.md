

## Make Reset Button Bigger on Mobile

Current button is `p-1.5` with a `w-3.5 h-3.5` icon — quite small for a touch target on mobile.

**Change in `FreestylePromptPanel.tsx` (line 260-262):**

Make the button and icon larger on mobile using responsive classes:

```tsx
className="absolute top-1 right-4 sm:right-5 p-2.5 sm:p-1.5 rounded-lg sm:rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 transition-colors"
```
```tsx
<RotateCcw className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5" />
```

This gives a ~40px touch target on mobile (meets accessibility guidelines) while keeping it compact on desktop. Single file change.

