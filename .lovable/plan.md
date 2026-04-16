

## Goal

Restyle the sidebar credits CTA so it matches vovv.ai brand colors instead of the warm amber/rose gradient, and swap the credits icon for one that reads better.

## Brand context

- Primary: deep navy (`217 33% 17%`), used as the strong CTA color
- Sidebar: dark navy background, light foreground
- No purple, no warm amber — palette is cool, neutral, premium
- Brand stays restrained / "luxury restraint" per design memory

So a loud warm gradient doesn't fit. The CTA should feel like a primary action on a dark sidebar — bright, clean, brand-aligned.

## Changes in `src/components/app/CreditIndicator.tsx`

### 1. Upgrade / Top up button — brand primary, subtle motion
Replace the amber/rose/orange gradient with a brand-aligned treatment:

- Base: solid white pill on the dark sidebar (`bg-white text-[hsl(var(--sidebar-background))]`) — maximum contrast, reads as the primary action.
- Subtle animated sheen: a faint white-to-transparent shimmer sweeping across the button using the existing `animate-shimmer` keyframe, but at very low opacity so it feels premium, not flashy. Implemented as an `::after`-style overlay via a child span with `bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] bg-[length:200%_100%] animate-shimmer mix-blend-overlay`.
- Hover: very slight scale or brightness lift, no color change.
- Keeps the same labels: `Upgrade` (free / has next plan) and `Top up` (max plan).

This matches how premium dark UIs handle their primary CTA (clean white pill, soft sheen) and sits naturally inside the navy sidebar.

### 2. Credits icon — switch from `Zap` to `Sparkles`
`Zap` reads as "energy/lightning" and clashes with the new clean white CTA. Switch to `Sparkles` which:
- Reads as "AI generations / credits" (industry standard for AI tools)
- Is more elegant, fits the luxury-restraint aesthetic
- Pairs better with the new white primary button than a hard lightning bolt

Render at `w-4 h-4`, `strokeWidth={1.75}`, color `text-sidebar-foreground/80` for a refined look (not the heavier `2.25` stroke).

### 3. Keep everything else
- No layout changes
- No logic changes (`navigate('/app/settings')` and `openBuyModal()` stay)
- Progress bar stays the same
- Card still non-clickable; only the CTA is interactive

## Expected result

- The CTA looks like a real primary action — clean white pill with a soft moving sheen — fully on-brand for vovv.ai.
- The icon shifts from a noisy bolt to a refined sparkle, reading clearly as "AI credits".
- The whole credits card feels premium and quiet, with one clear focal action.

