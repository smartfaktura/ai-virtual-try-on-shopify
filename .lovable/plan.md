

## Goal
Refine `/app/help` to feel like an Apple-designed support page: refined typography, intentional whitespace, subtle interactions, no visual noise.

## Issues with current page
- Form looks like a chat widget shoved on a page (tiny labels, dense inputs, gray send button never animates to active state visually)
- "What's on your mind?" + "Send a message to our team" stacked = redundant
- Two muted cards floating with weak hierarchy
- Avatar stack tiny, hero feels disconnected from form
- "Send Message" button is gray/disabled-looking even when active — Apple would use a confident accent

## Design direction (Apple-style)
- **Typography first**: larger title (text-4xl tracking-tight), single subtle subtitle, removed redundant micro-labels
- **One generous form, no card chrome**: inputs sit on page background with hairline borders, taller height (h-12), 15px text, floating-style labels above
- **Confident primary action**: full-width pill button, always solid foreground color when valid, smooth disabled state
- **Quieter secondary cards**: replace bordered/muted blocks with bare hover-only rows (icon + title + arrow), divided by hairline
- **Tighter avatar treatment**: bigger (w-12), softer ring, sits directly above title with smaller gap
- **Send confirmation**: refined inline success state matching new visual language (green dot, not full chip)

## Layout

```
─ Hero (centered or left, max-w-xl) ───
  [avatars w-12 -space-x-3]
  Talk to the team               (text-3xl, tracking-tight, font-semibold)
  Real humans, real fast.        (text-base muted)

─ Form (single column, generous) ──────
  Name
  [input h-12]
  Email
  [input h-12]
  Message
  [textarea, 5 rows]
  [Send message — full pill h-12]

─ Quiet helpers (hairline rows) ───────
  ─────────────────
  Browse FAQs           ↗
  ─────────────────
  Tutorials & guides    →
  ─────────────────

─ Footer ──────────────────────────────
  Email · Twitter · Instagram   (very small, muted)
```

## Files

| File | Change |
|---|---|
| `src/components/app/ChatContactForm.tsx` | New "polished" variant: add `variant?: 'compact' \| 'spacious'` prop. When `spacious`: floating labels above inputs, h-12 inputs, 15px text, full pill primary button, refined success state |
| `src/pages/AppHelp.tsx` | Restructure: bigger avatars, larger title, drop wrapper card around form (use spacious variant), replace twin grid cards with two hairline-divided rows, refine footer |

No new deps. No routing changes. Form submission logic untouched.

## Acceptance
- Page reads as one calm column with strong typographic hierarchy
- Form inputs are tall, breathable, with quiet labels above
- Primary button looks confident (solid, not gray) when fields valid
- FAQ + Learn collapse into two minimal rows separated by hairlines (not boxed cards)
- Mobile: still spacious, no cramped fields
- No visual regression in chat-widget usage of `ChatContactForm` (compact variant stays default)

