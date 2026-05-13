## Goal

Refine the 8 padel scene prompts so generated images consistently show:
1. **Proper padel-specific court shoes** (low-profile, herringbone/clay-court sole, reinforced toe cap, lateral support — no visible brand logos or wordmarks).
2. **Correct padel court line geometry** — service boxes, service line, center line, and baseline placed accurately for a real padel court.

No other aesthetic changes. The Instagram-vibe outdoor luxury club direction stays.

## Padel shoe directive (added to every prompt)

Replace the generic "white court shoes" line with a precise block, e.g.:

> **Footwear:** Padel-specific court shoes — low-profile silhouette, reinforced toe cap, supportive midsole, herringbone or clay-court tread pattern, predominantly white with subtle tonal accents, **no visible brand logos, wordmarks, swooshes, stripes, or text of any kind**. Worn with low white ankle socks.

## Padel court line directive (added to every prompt that shows the court)

Add a "Court geometry" block describing real padel court lines so the model places them correctly:

> **Court geometry (must be accurate):** Standard 20m × 10m padel court. Visible white lines limited to: the **baseline** along the back of each half, the **service line** drawn 2m in front of the back glass, and the **center service line** that splits the service area into left and right service boxes. **No outer sidelines** along the side glass walls (padel courts have no side singles/doubles lines like tennis). The net spans the full 10m width across the middle. Lines are crisp white, freshly painted, with realistic perspective.

## Per-scene tailoring of the geometry block

- **Glass Wall Hero / Post-Match Glass Lean** — court visible behind, baseline + service line + center line clearly placed in correct ratios.
- **Net Volley Ready** — net dead center; service line ~2m behind player on her side; center service line meeting the service line in a T.
- **Back Glass Recovery** — service line and center service line forming a clear T behind her toward the back glass; baseline visible at her feet.
- **Club Bench Rest** — court visible behind glass; same geometry rules apply when court is in frame.
- **Blue Court Warm-Up** — she stands inside the service box; T-junction of service line + center line near her feet.
- **Court Walk Entrance** — court ahead through cage door; baseline + service line visible in correct perspective.
- **Serve Prep at Baseline** — she stands behind the baseline; service line + center service line visible deep in the court ahead of her.

## Implementation

Single `supabase--insert` call running 8 UPDATE statements rewriting `prompt_template` only (mood untouched). All other prompt content (subject anchor, scene action, framing, light, grade, closing line) preserved verbatim from the previous Instagram-vibe rewrite — only the **footwear** line is replaced and a new **Court geometry** block is inserted before the closing line.

After it runs, ask the user to regenerate **Padel Net Volley Ready** and **Serve Prep at Baseline** first — those two best validate both the shoe detail and the line geometry.

## Out of scope

- Preview thumbnails, frontend, scene picker, category logic.
- Non-padel scenes.
- Mood text changes.
