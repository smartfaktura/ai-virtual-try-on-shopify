## Issue

The home page final CTA section (`HomeFinalCTA.tsx`) feels redundant and cluttered:

1. **VOVV.AI repetition** — "Start creating with **VOVV.AI**" sits directly above the footer which also renders the **VOVV** wordmark. Saying the brand name twice in two adjacent sections weakens the closing crescendo.
2. **Awkward SEO link row** — the three text links (`Explore AI product photography`, `Try the AI product photo generator`, `Create Shopify product photos`) sit centered under the CTA buttons looking like leftover keyword stuffing. They break the clean editorial rhythm and visually compete with the primary CTA.

## Fix

Edit only `src/components/home/HomeFinalCTA.tsx`:

**1. Rewrite the headline & subcopy** — remove the second VOVV.AI mention, make the closing message benefit-oriented and confident:

- Headline: `Start creating with VOVV.AI` → **`Your next product shoot starts here`**
- Subcopy: `Upload one product photo. See what VOVV.AI creates for your brand.` → **`Upload one product photo. Get a full campaign in minutes.`**

**2. Relocate the SEO interlinks** — they're useful for SEO but wrong placement. Move them out of the dark CTA card and render them as a quiet, low-emphasis row in the off-white band just above the footer (still inside `HomeFinalCTA` but in a separate light section below the dark band, with smaller muted type and a divider). This preserves SEO link equity without polluting the closing CTA.

Pattern:
```
[ Dark CTA band: eyebrow + headline + subcopy + 2 buttons ]   ← clean crescendo
[ Light band: tiny "Explore" eyebrow + 3 muted inline links ] ← SEO bridge into footer
[ Footer ]
```

**3. Tighten button row** — keep `Start free` (primary) and `See real examples` (secondary) unchanged; they already work.

## Out of scope

- No changes to `HomeFooter.tsx`, routing, or the SEO destination pages.
- No layout changes to other home sections.
