

## Subtitle period consistency — remove trailing periods

### Context
Memory Core rule: "no terminal periods in headers." The user is questioning whether subtitles like "Your next visuals are just a click away" should have periods. Per project convention: **no**.

Current screenshots show:
- "Your next visuals are just a click away" — no period ✓
- "Click any visual to recreate it with your product." — has period ✗
- "Your latest generated visuals" — no period ✓

Inconsistent. Need to extend the no-period rule to subtitles too and clean up offenders.

### Plan

1. Grep all `subtitle=` props and short tagline strings across `src/pages/**` and `src/components/app/**` for trailing periods.
2. Remove trailing `.` from single-sentence subtitles/taglines (keep periods only in multi-sentence body copy).
3. Focus on Dashboard first (the page user is viewing): "Click any visual to recreate it with your product." → "Click any visual to recreate it with your product"
4. Sweep `PageHeader subtitle=`, section subtitles ("Recent Creations" etc.), and EmptyStateCard descriptions across visible app pages.
5. Update memory Core rule to explicitly cover subtitles: "no terminal periods in headers or single-sentence subtitles."

### Acceptance
- All single-sentence subtitles across `/app` pages render without trailing period.
- Multi-sentence body copy keeps proper punctuation.
- Memory rule clarified for future consistency.

