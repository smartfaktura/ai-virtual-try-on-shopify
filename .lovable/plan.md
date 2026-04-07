

# Remove Problematic Auto-Injection of Directives

## Problem
The `buildDynamicPrompt` function (lines 837-842) force-injects **lighting**, **body framing**, **outfit lock**, and **person directives** into every prompt — even when the scene template already handles them or when they conflict with the scene intent. Example: an "In-Hand Use" scene gets a "Full-body shot — head to toe" body framing directive injected, which directly contradicts the close-up hand focus.

## What stays (safe universal appends)
These are non-conflicting and apply to all scenes:
- `REFERENCE_ISOLATION` prepended (line 845) ✓
- `QUALITY_SUFFIX` appended (line 851) ✓
- Camera directive appended (line 856) ✓
- Negative prompt appended (line 862) ✓
- Custom note appended (line 866) ✓
- Background injection **only when user explicitly set it** (lines 823-830) ✓ — already conditional

## What gets removed (4 `injectIfMissing` calls)
Lines 837-842 — remove these four auto-injections:
```
injectIfMissing('lighting', 'lightingDirective', false);
injectIfMissing('body framing', 'bodyFramingDirective');
injectIfMissing('outfit lock', 'outfitDirective', false);
injectIfMissing('model:', 'personDirective', false);
```

Templates are expected to include `{{lightingDirective}}`, `{{bodyFramingDirective}}`, `{{outfitDirective}}`, and `{{personDirective}}` tokens where needed. If a template omits them, it's intentional (e.g., product-only scenes should never get person/outfit injection).

The token resolution functions (`resolveToken`) still work — they just won't be force-appended when the template didn't ask for them.

## File
- `src/lib/productImagePromptBuilder.ts` — remove lines 837-842 (the four `injectIfMissing` calls and their comments), keep the `injectIfMissing` helper function in case it's needed for future use

