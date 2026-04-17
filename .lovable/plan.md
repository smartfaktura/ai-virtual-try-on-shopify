

## Enforce 2-line subtitle clamp on desktop workflow cards

### Root cause
DB descriptions are already short (60-82 chars), but `WorkflowCardCompact.tsx` line 153 uses `line-clamp-3` for the default (desktop) variant. Mobile/modal variants already use `line-clamp-2`. So on desktop, longer descriptions can stretch to 3 lines.

### Change
**File:** `src/components/app/WorkflowCardCompact.tsx` (line 153)
- `line-clamp-3` → `line-clamp-2`

That's it. Single-class change brings desktop in line with mobile + the rule "max 2 lines, ever".

### Acceptance
- All workflow cards on `/app/workflows` (desktop + mobile) display subtitles in maximum 2 lines.
- Long descriptions (e.g. "Stage empty rooms or boost curb appeal while keeping original architecture intact." — 82 chars) clamp at line 2 with ellipsis on desktop instead of wrapping to a 3rd line.

