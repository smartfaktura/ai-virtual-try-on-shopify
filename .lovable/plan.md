

## Improve Empty State Message

### Problem
The current Library empty state message ("Start a workflow to build your creative library.") only mentions workflows, but the app also supports freestyle generation. The message should acknowledge both paths.

### Fix
In `src/pages/Jobs.tsx`, update the `quote` prop to a shorter, inclusive message:

**Current:** "Start a workflow to build your creative library."
**New:** "Create stunning visuals with workflows or freestyle generation."

This is concise, mentions both CTAs, and feels natural above the two buttons.

