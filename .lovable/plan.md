

## Fix Settings page crash (`require is not defined`)

### Root cause

`src/pages/Settings.tsx` (lines 76-79) inside `ContentPreferencesSection` uses CommonJS `require()` to lazy-import `@/lib/onboardingTaxonomy`. Vite is ESM-only — `require` doesn't exist in the browser, so the component throws `ReferenceError: require is not defined` the moment a user visits `/app/settings`, triggering the ErrorBoundary.

```ts
// current — broken
const { SUB_TYPES_BY_FAMILY, getMultiSubFamilies, … cleanSubs } =
  require('@/lib/onboardingTaxonomy') as typeof import('@/lib/onboardingTaxonomy');
```

The "lazy-import to avoid circular paths in test envs" comment is a leftover precaution that isn't needed — `onboardingTaxonomy.ts` is a pure-data module with no React/circular deps, and the rest of the app already imports it statically.

### Fix

Convert to a normal ES static import at the top of the file, alongside the other `@/lib/*` imports, and delete the in-function `require` block.

**1. Add to the import block at the top of `src/pages/Settings.tsx`:**

```ts
import {
  SUB_TYPES_BY_FAMILY,
  getMultiSubFamilies,
  getSingleSubFamilies,
  getAutoIncludedSlugs,
  resolveFamilyNames,
  cleanSubs,
} from '@/lib/onboardingTaxonomy';
```

**2. Delete lines 76-79** (the `require` block + its eslint-disable comment). Everything below that already references the same names — no other changes needed.

### Files touched

```text
EDIT  src/pages/Settings.tsx   replace require() with ES import
```

No DB, no edge function, no taxonomy changes. Other pages (Onboarding, hooks) already use the static import and are unaffected.

### Validation

1. Navigate to `/app/settings` — page renders, no ErrorBoundary
2. "Content preferences" card shows current families + sub-types from profile
3. Toggle a sub-type, click Save → row updates, Resend sync still fires
4. Remove a family → its sub-types are pruned on save (unchanged behavior)

