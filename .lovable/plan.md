

## Move Reset Button to Better UX Position

The current Reset button sits alone in the action bar row — visually orphaned and awkward, especially on mobile. Better approach: move it to the **top-right corner of the textarea area** as a small icon-only button (no label), appearing only when dirty. This follows the pattern of text field "clear" buttons (like search inputs with an X).

### Change in `FreestylePromptPanel.tsx`

**Remove** the Reset button from the action bar (lines 295-303).

**Add** a small icon-only reset button positioned at the **top-right of the prompt textarea area** (Row 1, line ~243), floating as an absolute-positioned button:

```tsx
{/* Row 1 — Prompt Input */}
<div className={`relative px-4 sm:px-5 ${...} pb-3`}>
  <textarea ... />
  {isDirty && onReset && (
    <button
      onClick={onReset}
      className="absolute top-1 right-4 sm:right-5 p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 transition-colors"
      aria-label="Reset all settings"
    >
      <RotateCcw className="w-3.5 h-3.5" />
    </button>
  )}
</div>
```

This is a small, unobtrusive icon that sits in the top-right of the textarea — visible when needed, out of the way otherwise. No label needed — the icon is universally understood, and we can add a tooltip for clarity.

### Files
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — move reset button from action bar to textarea corner

