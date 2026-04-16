

# Revised Plan: Fix Feedback Card + Simple Trigger Logic

## Problems to Fix
1. Card missing from `Freestyle.tsx` entirely (that's the bug you hit)
2. Current dismiss key uses `resultId` which changes every generation, so it would show every time
3. Previous "smart trigger" plan was overcomplicated

## Revised Trigger Strategy

**One rule: show once per session per workflow.** That's it.

- Key: `vovv_fb_shown_{workflow}` in sessionStorage
- First successful generation in a workflow during this session → card appears after 2s delay
- User dismisses, submits, or skips → flag set, never shows again this session
- Next browser session → resets, shows once again on first generation

No generation counters. No trigger type props. No parent state threading.

## Technical Changes

### 1. `ContextualFeedbackCard.tsx` — simplify dismiss logic
- Change dismiss key from `workflow + resultId` to just `workflow`
- Remove `resultId` from the key calculation (still save it to DB for context)
- Keep the 2s delay and sessionStorage approach

```
// Before
const dismissKey = `${DISMISS_PREFIX}${workflow}_${resultId || 'latest'}`;

// After  
const dismissKey = `${DISMISS_PREFIX}${workflow}`;
```

### 2. `Freestyle.tsx` — add the card (the missing piece)
- Import `ContextualFeedbackCard`
- Render it when results exist and generation is complete
- Place it above the image gallery, below any success banner
- Props: workflow `'freestyle'`, question "Did this match what you had in mind?", standard reason chips

### 3. No changes needed to Generate.tsx or ProductImagesStep6Results.tsx
- They already have the card, and the dismiss key fix in the component itself will apply everywhere

## Files

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Simplify dismiss key to workflow-only |
| `src/pages/Freestyle.tsx` | Add ContextualFeedbackCard import + render |

## What We Skip
- Generation counters and `nth_generation` trigger — unnecessary complexity
- `post_action` trigger (Adjust/Start Over) — can add later if needed
- `post_paywall` trigger — separate feature, handled by existing conversion system

