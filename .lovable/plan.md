

## Fix Reset Button Size & Position on Mobile

Looking at the screenshot, the reset (RotateCcw) icon is visually too large and positioned awkwardly — it overlaps the placeholder text area and feels heavy.

### Current styling (line 260-263)
- Mobile: `p-2.5` padding, `top-1 right-4`, icon `w-4.5 h-4.5` → makes a ~40px touch target with a large icon
- Desktop: `p-1.5`, icon `w-3.5 h-3.5` → more subtle

### Proposed fix
- Reduce mobile icon size from `w-4.5 h-4.5` to `w-3.5 h-3.5` (same as desktop)
- Reduce mobile padding from `p-2.5` to `p-2` (still a comfortable ~32px touch target)
- Adjust position: `top-2 right-3` on mobile to sit more neatly inside the textarea corner

**Single change in `FreestylePromptPanel.tsx`, lines 258-264:**
```tsx
<button
  onClick={onReset}
  className="absolute top-2 right-3 sm:top-1 sm:right-5 p-2 sm:p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 transition-colors"
  aria-label="Reset all settings"
>
  <RotateCcw className="w-3.5 h-3.5" />
</button>
```

