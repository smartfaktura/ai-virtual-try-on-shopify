

## Goal
Create a new in-app `/app/help` page — a calm, premium support hub with: contact form, FAQ preview, Learn Hub link, and contact/social links.

## Approach

Reuse what already exists:
- **Contact form** → wrap the existing `ChatContactForm` (already wired to `send-contact` edge fn, validated, auth-prefilled).
- **FAQ data** → import `faqCategories` from `src/pages/HelpCenter.tsx` (extract to a shared module so both public `/help` and in-app `/app/help` use the same source of truth).
- **Learn entry** → small card linking to `/app/learn`.
- **Style** → match Learn page restraint (no heavy borders, generous whitespace, `text-[15px]` titles, muted descriptions).

## Layout (single column, max-w-3xl, mx-auto)

```
─ Header ──────────────────────────
  Help & support
  We usually reply within a few hours.

─ Contact (primary) ───────────────
  Card with ChatContactForm (slightly larger paddings than chat variant)

─ Quick answers (FAQ preview) ─────
  Inline accordion — show top 5 most relevant questions only
  Link: "Browse all FAQs →" (opens public /help in new tab)

─ Learn the basics ────────────────
  Single soft card → /app/learn  
  "Tutorials & guides — learn VOVV.AI in minutes"

─ Other ways to reach us ──────────
  Tiny row of links: Email · X/Twitter · Instagram · Status
  (text-only, no big icon grid)
```

Mobile: same single column, generous `py-6` between sections, sticky-friendly tap targets.

## Files

| File | Change |
|---|---|
| `src/data/faqContent.ts` | **New** — extract `faqCategories` array from `HelpCenter.tsx` so it's shared |
| `src/pages/HelpCenter.tsx` | Import `faqCategories` from new shared file (no UI change) |
| `src/pages/AppHelp.tsx` | **New** — the in-app help page |
| `src/App.tsx` | Add lazy import + `<Route path="/help" element={<AppHelp />} />` inside the `/app` shell block |
| `src/components/app/AppShell.tsx` | Add `LifeBuoy` icon link "Help & Support" under the **Learn** nav group → `/app/help`; add prefetch entry |

No schema changes. No new dependencies. Reuses `ChatContactForm`, `Accordion`, `send-contact` edge function.

## Acceptance
- `/app/help` renders inside AppShell with sidebar
- Contact form submits via existing `send-contact` flow, shows success state
- FAQ shows ~5 curated items; "Browse all" links to `/help`
- Learn card navigates to `/app/learn`
- Sidebar has new "Help & Support" entry under Learn group
- Spacious on desktop (1276px), comfortable stacking on mobile (375px)
- No new console errors

