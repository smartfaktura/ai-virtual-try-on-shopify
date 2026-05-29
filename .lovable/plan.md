# Update Phone Cases Product Spec Field

## What we're doing

Rename the first field in the phone-cases product details section from **"Compatibility"** to **"Phone Model"**, and update its placeholder to include the `e.g.` prefix so users understand it's an example, not a default value.

## Why

- **"Phone Model"** is clearer to users than **"Compatibility"** — the user immediately knows what to type
- The current placeholder (`iPhone 15 Pro`) looks like a pre-filled default, causing confusion
- Adding `e.g.` makes it obvious the text is just an example
- The underlying field key (`compatibility`) stays unchanged, so saved data and prompt tokens are unaffected

## Changes

**File:** `src/lib/productSpecFields.ts` (line 224)

```diff
  'phone-cases': [
-   { key: 'compatibility', label: 'Compatibility', type: 'input', placeholder: 'iPhone 15 Pro' },
+   { key: 'compatibility', label: 'Phone Model', type: 'input', placeholder: 'e.g. iPhone 17 Pro Max' },
    { key: 'material', label: 'Material', type: 'select', ... },
    ...
  ],
```

## Out of scope

- No database migration needed (field key unchanged)
- No prompt-builder changes needed (token key unchanged)
- No UI component changes needed (label is rendered dynamically from this config)
