

# Add "Help Us Improve" Label + Reposition Survey Before Actions

## Changes

### 1. Add "Help Us Improve" micro-label (`ContextualFeedbackCard.tsx`)
Add a small muted label above or inline with the question text in Step 1 to clarify purpose:
- Before the question text, add `Help Us Improve ·` as a prefix span with `text-muted-foreground/50` — subtler than the question itself
- This gives context without adding a separate line or breaking the compact layout

### 2. Move survey before action buttons (`ProductImagesStep6Results.tsx`)
Move the `ContextualFeedbackCard` block (lines 172-182) from after the actions Card to before it (between the image grid ending at line 155 and the actions Card at line 158). Flow becomes:

```text
Header → Image Grid → Feedback Survey → Action Buttons
```

## Files
| File | Change |
|------|--------|
| `ContextualFeedbackCard.tsx` | Lines 148-149: Add "Help Us Improve ·" prefix span before questionText in Step 1 pill |
| `ProductImagesStep6Results.tsx` | Move lines 172-182 to before line 157 (before the actions Card) |

