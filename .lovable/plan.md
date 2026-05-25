# Fix duplicate "Last updated" date on Terms page

## Problem

`/terms` currently shows the "Last updated" date **twice**:

1. `src/pages/TermsOfService.tsx` — page header renders `Last updated: April 2026` (stale, wrong month)
2. `src/components/legal/TermsContent.tsx` — body renders `LAST UPDATED: 25 MAY 2026`

Two different dates, two different formats, both visible on the same page. The same `TermsContent` is also embedded in the signup modal, so the date should live in exactly one place.

## Fix

**Single source of truth:** keep the date inside `TermsContent.tsx` only (so the signup modal also shows it), and remove the duplicate from the page header.

### `src/pages/TermsOfService.tsx`
- Remove the `<p className="text-sm text-muted-foreground">Last updated: April 2026</p>` line under the H1.

### `src/components/legal/TermsContent.tsx`
- Keep the existing `Last updated: 25 May 2026` line (correct date, matches the rewrite).
- No other content changes.

## Verification

Reload `/terms`:
- Only one "Last updated: 25 May 2026" visible (in the body, just above section 1).
- Header shows H1 + "Legal" chip only, no date.
- Open signup modal → Terms still shows the date inside the modal body.
