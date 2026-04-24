## Add Community section to Dashboard

A new banner inviting users to join Discord and follow socials, placed directly above the existing "Help us improve VOVV.AI" feedback banner. Visual style matches the FeedbackBanner so the two read as a paired set.

### New file: `src/components/app/CommunityBanner.tsx`

A self-contained component, no props, no state, no data fetching — so there's nothing to crash. Layout mirrors `UnifiedFeedbackBanner`'s collapsed state exactly:

- Outer card: `rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6` (identical to FeedbackBanner)
- Left: heading **"Join the community"** + subtitle **"Get early features, tips, and connect with other creators."**
- Right: a wrapping row of 4 pill buttons:
  - **Discord** — primary-filled pill (bg-primary, text-primary-foreground), with `ArrowUpRight` to signal external
  - **Instagram** — outlined ghost pill
  - **TikTok** — outlined ghost pill (custom inline SVG, since lucide has no TikTok icon)
  - **Facebook** — outlined ghost pill
- All links: `target="_blank" rel="noopener noreferrer"` with `aria-label`
- Pills wrap to next line on narrow screens; on mobile the whole layout stacks (heading on top, pills below)

### URLs used
- Discord: `https://discord.gg/ZgnSJqUyV`
- Instagram: `https://instagram.com/vovv.ai`
- TikTok: `https://tiktok.com/@vovv.ai`
- Facebook: `https://facebook.com/vovvaistudio`

### Edit: `src/pages/Dashboard.tsx`
- Add import: `import { CommunityBanner } from '@/components/app/CommunityBanner';`
- Render `<CommunityBanner />` immediately above `<FeedbackBanner />` (line 276)

### Why this won't crash
- No external data, no auth checks, no async, no context dependencies
- Only uses already-installed deps: `lucide-react` (Instagram, Facebook, ArrowUpRight) + `@/lib/utils` cn
- TikTok and Discord icons inlined as SVG (same approach already used in `LandingFooter.tsx` and the user menu)
- Uses only existing semantic Tailwind tokens (primary, foreground, muted-foreground, border, background) — fully theme-safe

### Style compliance
- All colors via design tokens (no hardcoded hex / rgb)
- Spacing, border radius, font sizes, and primary accent identical to surrounding dashboard cards
- Pill button shape (`rounded-full`, h-9, gap-1.5) matches the FeedbackBanner CTA and the dashboard quick-action chips
