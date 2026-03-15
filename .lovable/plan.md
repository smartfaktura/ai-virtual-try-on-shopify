

## Fix Reset Button Positioning on Desktop/Tablet

The reset button's absolute position needs to account for the parent's padding. The textarea content starts at `pt-4 sm:pt-5` (16px / 20px), so the button should align with that.

### Change — `FreestylePromptPanel.tsx`, line 260

Update positioning classes:

```tsx
// Before
className="absolute top-2 right-3 sm:top-1 sm:right-5 p-2 sm:p-1.5 ..."

// After  
className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 ..."
```

This aligns the button with the textarea's top-right corner at all breakpoints by matching the parent's padding values. Using consistent `p-1.5` padding keeps the icon compact.

