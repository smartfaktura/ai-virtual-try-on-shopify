

# Freestyle Feedback: Show Only Once on 3rd Generation

## Problem
Current logic shows the survey every 3rd freestyle generation (3rd, 6th, 9th...). The user wants it to appear **only once** — on the user's 3rd freestyle generation — and never again in freestyle after that.

## Change

### `src/components/app/ContextualFeedbackCard.tsx` — Lines 55-62
Update the freestyle condition from `count % 3 !== 0` to `count !== 3`:

```tsx
if (workflow === 'freestyle') {
  const countKey = `vovv_fb_gen_count_freestyle`;
  const count = parseInt(sessionStorage.getItem(countKey) || '0', 10) + 1;
  sessionStorage.setItem(countKey, String(count));
  if (count !== 3) {
    setStep('dismissed');
    return;
  }
}
```

This shows the survey exactly once — on the 3rd freestyle generation — and silently skips it for all other generations. Other workflows remain unaffected (show every time).

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Line 59: `count % 3 !== 0` → `count !== 3` |

