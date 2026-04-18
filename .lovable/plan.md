

## Fix /app/models subtitle

### Issue
Current `/app/models` subtitle is two sentences with a period: "Unlimited custom AI models — any gender, age, ethnicity, or body type. Built to match your brand identity."

Violates Core memory rule: no terminal periods on single-sentence subtitles, and the user wants it as **one engaging statement**.

### Plan
1. Locate the Models page (likely `src/pages/Models.tsx` or `src/pages/app/Models.tsx`) — confirm via search.
2. Replace the two-sentence subtitle with a single engaging statement, no trailing period.

**Proposed copy:**
> `"Unlimited custom AI models built to match your brand — any gender, age, ethnicity, or body type"`

Reads as one continuous thought, leads with the value ("Unlimited custom AI models built to match your brand"), then expands with the dimensions of customization.

### Acceptance
- One sentence, no trailing period
- Same information density, more engaging flow
- Matches memory Core rule

