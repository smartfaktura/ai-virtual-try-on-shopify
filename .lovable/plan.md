## Activation Nudge v3 — scene imagery + better footer

### 1. Swap 6 tile images to the scenes library

Use the `scenes/` folder in the public `landing-assets` bucket (18 available — picked the 6 most visually diverse and on-brand). All routed through Supabase image render for compression (`?quality=70&width=360&height=480&resize=cover`).

| Tile label   | Scene file                          |
|--------------|-------------------------------------|
| SKINCARE     | `scenes/scene-spa-towels.jpg`       |
| FRAGRANCE    | `scenes/scene-dried-flowers.jpg`    |
| HOME         | `scenes/scene-midcentury-console.jpg` |
| FASHION      | `scenes/scene-linen-textile.jpg`    |
| FOOD & DRINK | `scenes/scene-brunch-table.jpg`     |
| ACTIVEWEAR   | `scenes/scene-stone-path.jpg`       |

Category labels and 3×2 grid layout stay the same. No changes to hero, CTA, or micro-steps.

### 2. Footer — better version

Restructure to match the newsletter footer hierarchy more closely:

```text
VOVV                                          AI visuals for product brands
─────────────────────────────────────────────────────────────────────────
STUDIO              EXPLORE             COMPANY             FOLLOW
Visual Studio       Discover            Pricing             Instagram
Visual Types        Learn               Contact             LinkedIn
Library             Presets             Affiliates          X / Twitter
─────────────────────────────────────────────────────────────────────────
You're receiving this because you signed up for VOVV.
Manage preferences  ·  Unsubscribe  ·  View in browser
© 2026 VOVV  ·  vovv.ai  ·  Vilnius, Lithuania
```

Changes vs. current footer:
- 3 columns → 4 columns (Studio / Explore / Company / Follow), mobile-stacks to 1
- Added: Visual Types, Library, Presets, Affiliates, X/Twitter
- New "you're receiving this because…" reassurance line above legal row
- Manage preferences / Unsubscribe / View in browser grouped on one line
- Location appended to copyright row
- Same hairline divider, same cream bg, same `#9A9A9A` legal text

### 3. Subject line + preheader (3 options to pick from)

All use Resend triple-brace tokens with pipe fallbacks. Subject ≤ 50 chars, preheader 70–110 chars (renders fully in Gmail/Apple Mail without truncation).

**Option A — direct, credit-led** (recommended)
- Subject: `{{{FIRST_NAME|Hey}}}, your {{{credits_balance|20}}} credits are waiting`
- Preheader: `60 seconds to your first visual — pick a scene, upload a product, done`

**Option B — curiosity / outcome-led**
- Subject: `Your brand, in 60 seconds`
- Preheader: `{{{FIRST_NAME|Friend}}}, here's what your product could look like by tonight`

**Option C — soft nudge / FOMO-light**
- Subject: `Still thinking it over, {{{FIRST_NAME|friend}}}?`
- Preheader: `Your {{{credits_balance|20}}} free credits don't expire — but your first visual is one click away`

### 4. Output

Write `/mnt/documents/activation-nudge-email_v3.html` (keep v2 intact for comparison). No project source files touched.

---

**Question before I build:** which subject/preheader option (A, B, or C) should I bake into the HTML `<title>` and preheader div? Default is A unless you say otherwise.