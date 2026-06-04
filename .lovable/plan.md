## Plan

Single file: `src/lib/onboardingTaxonomy.ts`.

### Change
Remove `'streetwear'` from the `Fashion` sub-type array (line 35). Leave the `streetwear` label mapping (line 184) intact so existing users who already picked it still render correctly elsewhere.

### Scope
- Onboarding sub-category picker only. Fashion family no longer offers Streetwear.
- No DB migration, no taxonomy rename, no impact on Generate/Freestyle/Admin (those keep their `streetwear` pose category).

### Risk
None. Pure presentation removal from one array.