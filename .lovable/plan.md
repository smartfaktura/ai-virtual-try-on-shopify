
## Goal
Create `/app/bug-bounty` — an in-app page where users can report platform bugs and earn credit rewards. Add a "Bug Bounty" entry to the user dropdown menu (between Help & Support and Earn Credits).

## Design (matches /app aesthetic)
Reuses patterns from `/app/learn` and `EarnCreditsModal`:
- AppShell layout, max-w-4xl centered, generous vertical rhythm
- Hero: small uppercase eyebrow ("BUG BOUNTY"), tracking-tight headline, muted subtitle (no terminal period)
- Subtle bordered cards, `rounded-2xl`, `bg-white/[0.03]`, Inter font, pill buttons
- Bug icon (lucide) in a soft gradient header card
- Two-column "What qualifies ✓" / "What doesn't ✗" with green check / muted x icons
- Single primary CTA: "Report a bug" → `mailto:bugs@vovv.ai` (assumed — tell me if different)

## Page sections (in order)
1. **Hero** — "Help us make VOVV.AI better" + 1-line subtitle
2. **How it works** — 3 numbered steps: Find → Report → Get rewarded
3. **Reward tiers** — clean rows, severity → examples → credits
4. **What qualifies ✓ / doesn't qualify ✗** — two-column grid
5. **How to submit** — what to include (steps to reproduce, screenshot, browser, account email)
6. **CTA** — "Report a bug" pill button

## Reward tiers (platform bugs only, NOT AI output)
| Severity | Examples | Reward |
|---|---|---|
| Critical | Auth bypass, billing/credit miscalculation, data leak between users, payment broken | **500 credits** |
| High | Workflow completely broken, generation never starts, file upload broken, refund not issued | **200 credits** |
| Medium | Sidebar/nav broken, modal won't close, stats show wrong number, broken link | **75 credits** |
| Low / UX | Typos, minor visual glitch, copy improvement, contrast issue | **25 credits** |

Rules: one reward per unique confirmed bug, first reporter wins, VOVV team decides severity.

## What does NOT qualify (the AI-output gotcha — this is the protective copy)
- ❌ AI generation quality complaints — "model looks weird", "wrong color", "hands look bad", "didn't follow my prompt". AI output is probabilistic; use Regenerate or refine your prompt
- ❌ Style / aesthetic disagreements (subjective)
- ❌ Watermark or artifact in a single generation — only qualifies if reproducible across many runs and clearly a pipeline bug
- ❌ Slow generation unless consistently >10 min and reproducible
- ❌ Feature requests (use feedback channel)
- ❌ Issues caused by browser extensions / ad blockers
- ❌ Already reported by someone else
- ❌ Anything requiring you to break ToS (account sharing, scraping)

## What DOES qualify
- ✅ Credits deducted but no generation delivered (and no auto-refund within 10 min)
- ✅ Credits deducted incorrectly (charged 12 when display said 6)
- ✅ Cannot access your own data, or can access another user's data
- ✅ Login / signup / password reset broken
- ✅ Stripe payment succeeded but plan/credits not updated after 10 min
- ✅ Workflow step completely unusable on Chrome / Safari / Firefox latest
- ✅ Security issue (XSS, CSRF, exposed endpoint, leaked key, RLS gap)
- ✅ Broken admin actions on your own resources (delete, rename, download)

## Menu placement
Add "Bug Bounty" item to the user dropdown (Bug icon, lucide) between **Help & Support** and **Earn Credits**.

## Files to touch
- New: `src/pages/app/BugBounty.tsx`
- Update router (where `/app/learn` is registered) — add `/app/bug-bounty`
- Update user dropdown component (will grep — likely `src/components/app/UserMenu.tsx` or similar)

## Submission method
Default: **`mailto:bugs@vovv.ai`** with a prefilled subject + body template (account email auto-filled, browser/UA auto-filled). Zero backend, ships immediately. If you'd rather have an in-app form posting to an edge function, say so before I build.

## Out of scope (v1)
- DB table for tracked submissions
- Automatic credit issuance (team awards manually after triage)
- Public leaderboard
