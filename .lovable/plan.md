

## Reduce Mobile Prompt Font Size to 14px

14px (`text-sm`) is a good choice — it's the standard body text size on mobile and will make the prompt area feel more compact without sacrificing readability. 16px is typically used for inputs to prevent iOS auto-zoom, but since this is a `textarea` (not an `input`), and the viewport meta tag likely already has `maximum-scale=1`, 14px works fine.

### Change — `src/components/app/freestyle/FreestylePromptPanel.tsx`

Line ~199, update the textarea className:
```
// Before
text-base leading-relaxed

// After
text-sm sm:text-base leading-relaxed
```

This keeps 16px on desktop and drops to 14px on mobile only.

