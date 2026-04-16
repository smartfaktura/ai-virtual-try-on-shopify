

# Fix: Survey Card Not Showing in Virtual Try-On Set Results

## Problem
The previous change to limit feedback to the 3rd generation was applied to **all workflows** instead of only Freestyle. Lines 55-62 in `ContextualFeedbackCard.tsx` still have the blanket `count !== 3` check, which means the card only appears on the 3rd generation for every workflow — including virtual-try-on-set.

## Fix

### `src/components/app/ContextualFeedbackCard.tsx` — Lines 54-62
Wrap the generation counter logic in a `workflow === 'freestyle'` check so only Freestyle is throttled. All other workflows skip the counter and always show:

```tsx
// Freestyle: only show on the 3rd generation, then never again
if (workflow === 'freestyle') {
  const countKey = `vovv_fb_gen_count_freestyle`;
  const count = parseInt(sessionStorage.getItem(countKey) || '0', 10) + 1;
  sessionStorage.setItem(countKey, String(count));
  if (count !== 3) {
    setStep('dismissed');
    return;
  }
}
const t = setTimeout(() => setStep('step1'), 2000);
return () => clearTimeout(t);
```

Single file, single block change.

