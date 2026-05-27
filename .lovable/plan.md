# Rebuild activation nudge email (v5) — match reference design exactly

Create `/mnt/documents/activation-nudge-email_v5.html` from scratch using the structure, tokens, and rhythm from the attached reference (`email.rtf`). Discard every layout choice from v4 (badge chip, 6-tile scene grid, dual CTA row, plan caption). Nothing from v4 is reused.

## Subject + preview (in HTML comment block at top)

- Subject A: `Your {{{credits_balance|20}}} credits are waiting, {{{FIRST_NAME|friend}}}`
- Subject B: `One product photo in, editorial visual out`
- Subject C: `{{{FIRST_NAME|friend}}}, your VOVV.AI studio is set up`
- Preview: `Pick up where you left off — your studio is one click away`

## Structure (1:1 with reference)

```text
outer bg #FAFAF8, 48px 16px padding
└── 560px white card, 1px #E7E5E4, radius 14px, overflow hidden
    ├── VOVV wordmark (20px / 700 / -0.03em), top-left, padding 32px 40px 24px
    ├── Full-bleed hero image, 560×260, object-cover
    ├── H1 "Almost there" — 30px / 600 / -0.025em
    ├── Intro paragraph (16px / #475569)
    ├── Bold lead-in "What's waiting on the other side"
    ├── 18px spacer
    ├── 3 numbered rows: 24px dark circle badge + 14.5px / 500 #0F172A text
    ├── 32px spacer
    ├── Dark pill CTA "Open Visual Studio →" + ghost link "Browse scenes →"
    ├── 36px spacer
    ├── Helper paragraph (Reply / Discord)
    ├── 40px spacer
    ├── "JOIN THE COMMUNITY" eyebrow (11px / 600 / 0.18em / #64748B)
    ├── Discord gradient card (linear-gradient 135deg #0F172A → #1E293B, radius 14px)
    │     title + body + white pill "Join Discord →"
    ├── "Also follow us" + Instagram / TikTok / Facebook white pill links
    ├── 40px spacer
    └── Footer (border-top, 28px 40px 32px): account line + Unsubscribe · © 2026 VOVV · A product by 123Presets
```

## Copy (short, VOVV.AI-accurate)

- H1: `Almost there`
- Intro: `You have {{{credits_balance|20}}} credits waiting on your VOVV.AI account, {{{FIRST_NAME|friend}}}. We saved your spot — finish whenever you're ready.`
- Lead-in: `What's waiting on the other side`
- Step 1: `Editorial product visuals from a single photo`
- Step 2: `Scenes, brand models, packaging — all in Visual Studio`
- Step 3: `Store-, ad-, and social-ready — no studio, no retouching`
- Primary CTA: `Open Visual Studio  →` → `https://vovv.ai/app/workflows`
- Ghost CTA: `Browse scenes →` → `https://vovv.ai/app/discover`
- Helper: `Stuck on what to try first? Reply to this email — a real person on our team will answer. Or ask the Discord community.`
- Discord title: `Discord — where VOVV.AI lives`
- Discord body: `Share your visuals, swap scene tips with other founders, request new Visual Types, and see drops before they ship.`
- Discord CTA: `Join Discord  →` → `https://discord.gg/ZgnSJqUyV`
- Socials: Instagram `https://www.instagram.com/vovv.ai`, TikTok `https://www.tiktok.com/@vovv.ai`, Facebook `https://www.facebook.com/vovvaistudio/`
- Footer: `You're getting this because you have an account at VOVV.AI` + Unsubscribe link `{{{RESEND_UNSUBSCRIBE_URL}}}` + `© 2026 VOVV · A product by 123Presets`

## Visual tokens (lifted verbatim from reference)

- bg `#FAFAF8` · card `#FFFFFF` · border `#E7E5E4` · radius `14px`
- text `#0F172A` · body `#475569` · muted `#64748B`
- Inter 400 / 500 / 600 / 700
- pill CTA `#0F172A`, radius `10px`, 15px / 28px padding
- Discord gradient `linear-gradient(135deg,#0F172A 0%,#1E293B 100%)` radius `14px`
- social pills `#FFFFFF` bg + `#E7E5E4` border + radius `999px`
- `@media max-width:600px` → `.container{width:100%}`, `.px{padding:24px}`, `.h1{font-size:26px}`, `.hero{height:auto}`

## Hero image

`https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/landing-assets/email/5.png` (same one used in the reference). One hero only — no scene grid.

## Out of scope

- No changes to v3/v4 files, no code or DB changes
- No scene tile grid, no chips, no plan caption
- No realtime / security work in this loop

Approve to build `/mnt/documents/activation-nudge-email_v5.html`.
