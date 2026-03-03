

## Fix Content Blocked Card: Grid Sizing + Branded Design + Credit Refund Verification

### Issues Found

1. **Card too big** — `ContentBlockedCard` uses `min-h-[300px] h-full` with no `aspectRatio`, so it stretches taller than grid siblings. It needs `aspectRatio: 1/1` (matching the default generation ratio) to sit properly in the masonry grid.

2. **Not branded** — The card is a plain grey box. Should match VOVV.AI's luxury aesthetic: dark navy palette, team avatar, warmer copy.

3. **Credits appear not refunded** — The backend *does* call `refund_credits` (line 589). The frontend *does* call `refreshBalance()` on `failed` status (line 436). However, when content is blocked via the new `completed` + `contentBlocked` path, the balance refresh happens but the user sees no confirmation. We need a toast or inline message confirming refund.

### Changes — 2 files

**1. `src/components/app/freestyle/FreestyleGallery.tsx`** — Redesign `ContentBlockedCard`

- Remove `min-h-[300px] h-full`, add `style={{ aspectRatio: '1/1' }}` so it matches the 1:1 grid default
- Redesign to VOVV.AI branded style:
  - Dark navy background (`bg-[#0f172a]`) with subtle gradient
  - Team avatar with glow ring (reuse `STUDIO_CREW` random pick like `GeneratingCard`)
  - Copy: "{Name} couldn't create this" + "Your prompt was flagged by our content policy. Credits have been refunded."
  - Rephrase button in pill style (`rounded-full bg-white text-[#0f172a]`)
  - Dismiss as subtle text link
- Add credit refund confirmation text directly on the card

**2. `src/pages/Freestyle.tsx`** — Add refund toast for blocked content

- In the `contentBlocked` completion handler (line 416-424), add `toast('Credits refunded', { description: '...' })` so user gets explicit confirmation alongside the blocked card.

