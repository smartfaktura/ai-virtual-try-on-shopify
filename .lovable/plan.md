

# Audit: Are there other guards with the same flaw?

## What caused the background bug
The guard `!prompt.toLowerCase().includes('background')` failed because "background" is a **common word** that appears naturally in many scene templates — so the check almost always evaluated to `false`, silently skipping the user's choice.

## Are there other instances?

**No — the background guard was the only active instance of this anti-pattern.** Here's the full audit:

| Line | Guard | Risk |
|------|-------|------|
| 1149 | `!prompt.toLowerCase().includes(keyword)` | **Dead code** — `injectIfMissing` is defined but never called anywhere. No impact. |
| 1176 | `!prompt.includes('8K commercial quality')` | Safe — exact unique phrase, won't appear by accident |
| 1182 | `!prompt.includes('lens at')` | Safe — specific technical phrase |
| 1196 | `!prompt.includes(details.customNote)` | Safe — matches the user's exact text to prevent duplication |

## One cleanup opportunity

The `injectIfMissing` helper (lines 1146-1151) is **dead code** — it was the old auto-injection mechanism before you switched to the template-led approach. It still carries the same flawed `.includes(keyword)` pattern. If it's ever re-enabled, it would cause the same class of bug.

### Recommendation
Delete the unused `injectIfMissing` function (lines 1146-1152) to prevent future confusion. **3 lines removed, no behavior change.**

