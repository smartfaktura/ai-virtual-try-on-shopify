

## Fix /app/discover subtitle

The public `/discover` page has it right ("Every image here was created by AI. Yours can be next." — but that's two sentences with periods on a public marketing page, which is allowed).

The user wants `/app/discover` (authenticated app version) fixed: single sentence, no period.

### Find & fix

Need to locate the app-side Discover page (likely `src/pages/Discover.tsx` or similar) and update its `PageHeader subtitle` to a single sentence with no trailing period.

### Plan
1. Locate `/app/discover` page component.
2. Replace current subtitle with a single sentence, no period — e.g. `"Browse AI-generated visuals and recreate any look with your product"`.

### Acceptance
- `/app/discover` header shows one clean sentence
- No trailing period
- Matches memory rule for app subtitles

